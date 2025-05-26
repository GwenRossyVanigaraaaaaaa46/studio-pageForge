
"use client";

import type React from 'react';
import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { usePageBuilder } from '@/contexts/PageBuilderContext';
import type { ComponentProperty, FormFieldProps } from '@/types/page-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FormField: React.FC<FormFieldProps> = ({ property, control }) => {
  const { name, label, type, options, placeholder } = property; 

  return (
    <div className="mb-4">
      <Label htmlFor={name} className="text-sm font-medium mb-1 block">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const valuePropForInput = type === 'file' ? undefined : (field.value ?? '');
          const fieldProps = { ...field, placeholder, id: name, value: valuePropForInput };
          
          switch (type) {
            case 'text':
            case 'url':
            case 'color':
              return <Input type={type === 'color' ? 'text' : type} {...fieldProps} />;
            case 'number':
              return <Input 
                        type="number" 
                        {...fieldProps} 
                        value={field.value === null || field.value === undefined || isNaN(parseFloat(field.value as string)) ? '' : String(field.value)}
                        onChange={e => {
                            const numVal = parseFloat(e.target.value);
                            field.onChange(isNaN(numVal) ? (property.defaultValue ?? 0) : numVal);
                        }} 
                     />;
            case 'textarea':
              return <Textarea {...fieldProps} rows={3} />;
            case 'select':
              return (
                <Select 
                  onValueChange={(val) => field.onChange(val)} 
                  value={String(field.value ?? property.defaultValue ?? '')} 
                >
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.map(option => (
                      <SelectItem key={option.value.toString()} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            case 'file':
              return (
                <Input
                  type="file"
                  id={name}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        field.onChange(reader.result as string); 
                      };
                      reader.readAsDataURL(file);
                    } else {
                      field.onChange(''); 
                    }
                  }}
                  {...{...field, value: undefined }} // value must be undefined for file input
                />
              );
            default:
              return <Input type="text" {...fieldProps} />;
          }
        }}
      />
    </div>
  );
};

const PropertyEditor: React.FC = () => {
  const { 
    editingComponent, 
    updateComponentProps, 
    getComponentDefinition,
    closePropertyEditor, 
    isPropertyEditorPanelOpen 
  } = usePageBuilder();
  const { toast } = useToast();
  
  const definition = editingComponent ? getComponentDefinition(editingComponent.type) : null;

  const { control, handleSubmit, reset, getValues } = useForm({});
  const prevEditingComponentIdRef = useRef<string | null | undefined>();

  useEffect(() => {
    if (editingComponent && definition) {
      if (editingComponent.id !== prevEditingComponentIdRef.current || (editingComponent && !prevEditingComponentIdRef.current) || (!editingComponent && prevEditingComponentIdRef.current) ) {
        let initialFormValues: Record<string, any> = { ...definition.defaultProps, ...editingComponent.props };
        
        if (definition.type === 'ImageElement') {
          const currentSrc = editingComponent.props.src;
          if (typeof currentSrc === 'string' && (currentSrc.startsWith('http://') || currentSrc.startsWith('https://'))) {
            initialFormValues.imageUrl = currentSrc; 
            initialFormValues.src = ''; 
          } else { 
            initialFormValues.imageUrl = ''; 
            initialFormValues.src = currentSrc || ''; 
          }
        }
        
        definition.properties.forEach(prop => {
          if (prop.type === 'select' && typeof initialFormValues[prop.name] === 'boolean') {
            initialFormValues[prop.name] = String(initialFormValues[prop.name]);
          }
        });

        reset(initialFormValues);
        prevEditingComponentIdRef.current = editingComponent.id;
      }
    } else if (!editingComponent && prevEditingComponentIdRef.current) { 
      reset({}); 
      prevEditingComponentIdRef.current = null;
    }
  }, [editingComponent, definition, reset]);


  const onSubmit = (data: Record<string, any>) => { 
    if (editingComponent && definition) {
      const finalComponentProps: Record<string, any> = {};

      if (definition.type === 'ImageElement') {
        let newSrc = ''; 
        const formImageUrl = typeof data.imageUrl === 'string' ? data.imageUrl.trim() : '';
        const formDataUri = typeof data.src === 'string' && data.src.startsWith('data:image') ? data.src : '';

        if (formImageUrl) {
          newSrc = formImageUrl;
        } else if (formDataUri) {
          newSrc = formDataUri;
        } else {
          // If both are empty, try to retain existing src if it was valid
          const existingSrc = editingComponent.props.src;
          if (typeof existingSrc === 'string' && (existingSrc.startsWith('http') || existingSrc.startsWith('data:image'))) {
            newSrc = existingSrc;
          } else {
            newSrc = definition.defaultProps.src || ''; // Fallback to default (placeholder)
          }
        }
        
        finalComponentProps.src = newSrc;
        // Other ImageElement specific props
        definition.properties.forEach(prop => {
          if (prop.name !== 'src' && prop.name !== 'imageUrl') { 
            let formValue = data[prop.name];
            if (prop.type === 'number') {
              finalComponentProps[prop.name] = parseFloat(formValue as string) || (prop.defaultValue ?? 0);
            } else if (prop.name === 'linkOpenInNewTab') { 
                finalComponentProps[prop.name] = formValue === 'true';
            } else {
              finalComponentProps[prop.name] = formValue ?? prop.defaultValue;
            }
          }
        });

      } else { 
        definition.properties.forEach(prop => {
          let formValue = data[prop.name];
          
          if (formValue === undefined || formValue === null) {
              finalComponentProps[prop.name] = editingComponent.props[prop.name] ?? prop.defaultValue;
              return;
          }

          if (prop.type === 'number') {
             if (typeof formValue === 'string') {
              const numVal = parseFloat(formValue);
              finalComponentProps[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
            } else if (typeof formValue === 'number') {
              finalComponentProps[prop.name] = formValue;
            } else {
              finalComponentProps[prop.name] = (prop.defaultValue ?? 0);
            }
          } else if (prop.type === 'select' && typeof prop.defaultValue === 'number') { 
            if (typeof formValue === 'string') {
              const numVal = parseInt(formValue, 10);
              finalComponentProps[prop.name] = isNaN(numVal) ? prop.defaultValue : numVal;
            } else if (typeof formValue === 'number') {
              finalComponentProps[prop.name] = formValue;
            } else {
              finalComponentProps[prop.name] = prop.defaultValue;
            }
          } else if (prop.type === 'select' && typeof prop.defaultValue === 'boolean') {
            finalComponentProps[prop.name] = formValue === 'true';
          }
           else { 
              finalComponentProps[prop.name] = formValue;
          }
        });
      }
      updateComponentProps(editingComponent.id, finalComponentProps);
      toast({
        title: "Properties Saved",
        description: `${definition.name} properties have been updated.`,
      });
    }
  };

  if (!isPropertyEditorPanelOpen || !editingComponent || !definition) {
    return (
      <Card className="h-full flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold flex items-center">
          <Settings className="mr-2 h-5 w-5 text-primary" />
            Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground p-4 text-center">Select a component on the canvas to edit its properties.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Settings className="mr-2 h-5 w-5 text-primary" />
          Edit {definition.name}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={closePropertyEditor} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden"> {/* Added overflow-hidden here */}
        <ScrollArea className="h-full">
          <div className="p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              {definition.properties.map(prop => {
                // Do not render 'imageUrl' if 'src' (file upload) has a value (Data URI)
                if (prop.name === 'imageUrl' && typeof getValues('src') === 'string' && getValues('src').startsWith('data:image')) return null;
                return <FormField key={prop.name} property={prop} control={control} form={{ control, handleSubmit, reset, getValues } as any} />;
              })}
              <Button type="submit" className="w-full mt-4"> {/* Reduced margin */}
                Save Changes
              </Button>
            </form>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PropertyEditor;
