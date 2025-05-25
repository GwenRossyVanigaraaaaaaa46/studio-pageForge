
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Settings } from 'lucide-react';

const FormField: React.FC<FormFieldProps> = ({ property, control }) => {
  const { name, label, type, options, placeholder } = property; // defaultValue removed from here

  return (
    <div className="mb-4">
      <Label htmlFor={name} className="text-sm font-medium mb-1 block">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        // defaultValue prop removed here as reset() should handle setting form values
        render={({ field }) => {
          // Ensure field.value is not null or undefined for controlled components that expect strings
          const value = field.value ?? ''; 
          const fieldProps = { ...field, placeholder, id: name, value };
          
          switch (type) {
            case 'text':
            case 'url':
            case 'color': // Basic text input for color, can be enhanced with a color picker
              return <Input type={type === 'color' ? 'text' : type} {...fieldProps} />;
            case 'number':
              return <Input 
                        type="number" 
                        {...fieldProps} 
                        // value needs to be string for input type=number, or handle empty string for controlled component
                        value={field.value === null || field.value === undefined || isNaN(parseFloat(field.value)) ? '' : String(field.value)}
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
                  onValueChange={(val) => field.onChange(val)} // val is already string from SelectItem
                  value={String(field.value)} // Ensure value is a string for Select
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
    isPropertyEditorOpen
  } = usePageBuilder();
  
  const definition = editingComponent ? getComponentDefinition(editingComponent.type) : null;

  const { control, handleSubmit, reset, watch } = useForm({
    // Default values are primarily set by the reset effect
  });

  const prevEditingComponentIdRef = useRef<string | null | undefined>();

  useEffect(() => {
    if (editingComponent && definition) {
      if (editingComponent.id !== prevEditingComponentIdRef.current || !prevEditingComponentIdRef.current) {
        const defaultValuesWithDef = { ...definition.defaultProps, ...editingComponent.props };
        reset(defaultValuesWithDef);
        prevEditingComponentIdRef.current = editingComponent.id;
      }
    } else if (prevEditingComponentIdRef.current) { 
      reset({}); 
      prevEditingComponentIdRef.current = null;
    }
  }, [editingComponent, definition, reset]);


  const watchedValues = watch();
  useEffect(() => {
    if (editingComponent && definition && Object.keys(watchedValues).length > 0) {
      const coercedProps = { ...watchedValues };

      definition.properties.forEach(prop => {
        const formValue = watchedValues[prop.name];
        
        if (formValue === undefined || formValue === null) { // Allow undefined or null to pass through for now
            coercedProps[prop.name] = formValue;
            return;
        }

        if (prop.type === 'number') {
          if (typeof formValue === 'string') {
            const numVal = parseFloat(formValue);
            coercedProps[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
          } else if (typeof formValue === 'number') {
            coercedProps[prop.name] = formValue; // Already a number
          } else {
             coercedProps[prop.name] = (prop.defaultValue ?? 0); // Fallback for unexpected types
          }
        } else if (prop.type === 'select' && typeof prop.defaultValue === 'number') {
          // If the select's default value is a number, assume its value should be numeric
          if (typeof formValue === 'string') {
            const numVal = parseInt(formValue, 10);
            coercedProps[prop.name] = isNaN(numVal) ? prop.defaultValue : numVal;
          } else if (typeof formValue === 'number') {
            coercedProps[prop.name] = formValue; // Already a number
          } else {
            coercedProps[prop.name] = prop.defaultValue; // Fallback
          }
        }
        // Other types are assumed to be correctly typed by the form (e.g., string for text/textarea)
        // or don't need explicit coercion beyond what react-hook-form provides.
      });
      
      let propsAreDifferent = false;
      const currentProps = editingComponent.props;
      const allKeys = new Set([...Object.keys(currentProps), ...Object.keys(coercedProps)]);

      for (const key of allKeys) {
        const valFromForm = coercedProps[key];
        const valFromState = currentProps[key];

        if (Number.isNaN(valFromForm) && Number.isNaN(valFromState)) {
          continue;
        }
        if (valFromForm !== valFromState) {
          propsAreDifferent = true;
          break;
        }
      }

      if (propsAreDifferent) {
        updateComponentProps(editingComponent.id, coercedProps);
      }
    }
  }, [watchedValues, editingComponent, definition, updateComponentProps, getComponentDefinition]);


  const onSubmit = (data: Record<string, any>) => {
    if (editingComponent && definition) {
      const finalData = { ...data };
      definition.properties.forEach(prop => {
        // Coercion for submit, similar to live update
        const formValue = finalData[prop.name];
        if (formValue === undefined || formValue === null) return;

        if (prop.type === 'number') {
           if (typeof formValue === 'string') {
            const numVal = parseFloat(formValue);
            finalData[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
          }
        } else if (prop.type === 'select' && typeof prop.defaultValue === 'number') {
          if (typeof formValue === 'string') {
            const numVal = parseInt(formValue, 10);
            finalData[prop.name] = isNaN(numVal) ? prop.defaultValue : numVal;
          }
        }
      });
      updateComponentProps(editingComponent.id, finalData);
    }
  };

  if (!isPropertyEditorOpen || !editingComponent || !definition) {
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
              <FormField key={prop.name} property={prop} control={control} form={{control, handleSubmit, reset, watch} as any} />
            ))}
          </form>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button onClick={handleSubmit(onSubmit)} className="w-full bg-primary hover:bg-primary/90">
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyEditor;
    
