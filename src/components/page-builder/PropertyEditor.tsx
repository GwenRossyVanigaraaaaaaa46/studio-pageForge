
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
      if (editingComponent.id !== prevEditingComponentIdRef.current || (editingComponent && !prevEditingComponentIdRef.current) ) {
        // Prioritize existing props, then fall back to definition's defaultProps
        let initialFormValues: Record<string, any> = { ...definition.defaultProps, ...editingComponent.props };
        
        // Special handling for ImageElement's src:
        // The form itself will use `src` for the file upload's data URI.
        // We don't need to transform it here as the `editingComponent.props.src` already holds the correct value (Data URI or empty).
        if (definition.type === 'ImageElement') {
           initialFormValues.src = editingComponent.props.src || definition.defaultProps.src || '';
        }
        
        // Coerce boolean values to string for select fields to match SelectItem values
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
      let componentFinalProps: Record<string, any> = { ...(editingComponent.props || {}) }; 

      if (definition.type === 'ImageElement') {
        // Determine the src for the ImageElement
        let determinedSrc = '';
        const dataUriFromForm = typeof data.src === 'string' && data.src.startsWith('data:image') ? data.src : null;

        if (dataUriFromForm) {
          determinedSrc = dataUriFromForm;
        } else if (editingComponent.props.src && editingComponent.props.src.startsWith('data:image')) {
          // Retain existing valid data URI if no new file is uploaded but form's src might be cleared/invalid
          determinedSrc = editingComponent.props.src;
        } else {
          determinedSrc = definition.defaultProps.src || ''; // Fallback to default
        }
        componentFinalProps.src = determinedSrc;

        // Update other ImageElement properties from form data
        definition.properties.forEach(propDef => {
          if (propDef.name === 'src') return; // src handled above

          const formValue = data[propDef.name];
          if (formValue !== undefined) { 
            if (propDef.type === 'number') {
              componentFinalProps[propDef.name] = parseFloat(formValue as string) || (propDef.defaultValue ?? 0);
            } else if (propDef.name === 'linkOpenInNewTab') {
              componentFinalProps[propDef.name] = formValue === 'true';
            } else {
              componentFinalProps[propDef.name] = formValue;
            }
          }
        });

      } else { 
        definition.properties.forEach(prop => {
          let formValue = data[prop.name];
          
          if (formValue === undefined || formValue === null) {
            componentFinalProps[prop.name] = editingComponent.props[prop.name] ?? prop.defaultValue;
            return;
          }

          if (prop.type === 'number') {
             if (typeof formValue === 'string') {
              const numVal = parseFloat(formValue);
              componentFinalProps[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
            } else if (typeof formValue === 'number') {
              componentFinalProps[prop.name] = formValue;
            } else {
              componentFinalProps[prop.name] = (prop.defaultValue ?? 0);
            }
          } else if (prop.type === 'select' && typeof prop.defaultValue === 'number') { 
            if (typeof formValue === 'string') {
              const numVal = parseInt(formValue, 10);
              componentFinalProps[prop.name] = isNaN(numVal) ? prop.defaultValue : numVal;
            } else if (typeof formValue === 'number') {
              componentFinalProps[prop.name] = formValue;
            } else {
              componentFinalProps[prop.name] = prop.defaultValue;
            }
          } else if (prop.type === 'select' && typeof prop.defaultValue === 'boolean') {
            componentFinalProps[prop.name] = formValue === 'true';
          } else { 
              componentFinalProps[prop.name] = formValue;
          }
        });
      }
      updateComponentProps(editingComponent.id, componentFinalProps);
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
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              {definition.properties.map(prop => (
                 <FormField key={prop.name} property={prop} control={control} form={{ control, handleSubmit, reset, getValues } as any} />
              ))}
              <Button type="submit" className="w-full mt-2">
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
