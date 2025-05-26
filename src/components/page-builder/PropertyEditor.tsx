
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
          const value = type === 'file' ? undefined : (field.value ?? '');
          const fieldProps = { ...field, placeholder, id: name, value };
          
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
                  {...{...field, value: undefined, placeholder, id:name}}
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

  const { control, handleSubmit, reset } = useForm({}); // Removed watch from here as it's not used for live updates anymore

  const prevEditingComponentIdRef = useRef<string | null | undefined>();

  useEffect(() => {
    if (editingComponent && definition) {
      if (editingComponent.id !== prevEditingComponentIdRef.current || !prevEditingComponentIdRef.current) {
        let initialFormValues = { ...definition.defaultProps, ...editingComponent.props };
        if (definition.type === 'ImageElement') {
          const currentSrc = editingComponent.props.src;
          if (typeof currentSrc === 'string' && (currentSrc.startsWith('http://') || currentSrc.startsWith('https://'))) {
            initialFormValues.imageUrl = currentSrc;
          } else {
            initialFormValues.imageUrl = ''; 
          }
        }
        reset(initialFormValues);
        prevEditingComponentIdRef.current = editingComponent.id;
      }
    } else if (prevEditingComponentIdRef.current || (!editingComponent && isPropertyEditorPanelOpen)) { 
      reset({}); 
      prevEditingComponentIdRef.current = null;
    }
  }, [editingComponent, definition, reset, isPropertyEditorPanelOpen]);

  const onSubmit = (data: Record<string, any>) => { 
    if (editingComponent && definition) {
      const finalComponentProps: Record<string, any> = {};

      if (definition.type === 'ImageElement') {
        if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() !== '') {
          finalComponentProps.src = data.imageUrl;
        } else if (data.src && typeof data.src === 'string' && data.src.startsWith('data:image')) {
          finalComponentProps.src = data.src;
        } else {
          finalComponentProps.src = editingComponent.props.src || definition.defaultProps.src || '';
        }
        finalComponentProps.alt = data.alt ?? definition.defaultProps.alt;
        finalComponentProps.width = data.width ?? definition.defaultProps.width;
        finalComponentProps.height = data.height ?? definition.defaultProps.height;
        finalComponentProps.objectFit = data.objectFit ?? definition.defaultProps.objectFit;
      } else {
        definition.properties.forEach(prop => {
          let formValue = data[prop.name];
          
          if (formValue === undefined || formValue === null) {
              finalComponentProps[prop.name] = formValue;
              return;
          }
          if (prop.type === 'file') {
             finalComponentProps[prop.name] = formValue;
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
          } else {
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
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            {definition.properties.map(prop => (
              <FormField key={prop.name} property={prop} control={control} form={{control, handleSubmit, reset} as any} />
            ))}
            <Button type="submit" className="w-full mt-6">
              Save Changes
            </Button>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PropertyEditor;
