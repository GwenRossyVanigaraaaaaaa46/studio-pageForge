
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

const FormField: React.FC<Pick<FormFieldProps, 'property' | 'control'>> = ({ property, control }) => {
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

const getCoercedValue = (property: ComponentProperty, formValue: any): any => {
  if (formValue === undefined || formValue === null || formValue === '') {
    if (property.defaultValue !== undefined) {
      return property.defaultValue;
    }
    switch (property.type) {
      case 'number': return 0;
      case 'select': 
        if (typeof property.defaultValue === 'boolean') return false;
        if (typeof property.defaultValue === 'number') return 0;
        return ''; 
      default: return ''; 
    }
  }

  switch (property.type) {
    case 'number':
      const numVal = parseFloat(formValue);
      return isNaN(numVal) ? (property.defaultValue ?? 0) : numVal;
    case 'select':
      if (typeof property.defaultValue === 'boolean') {
        return formValue === 'true';
      }
      if (typeof property.defaultValue === 'number') {
        const selectedNumVal = parseFloat(formValue);
        return isNaN(selectedNumVal) ? property.defaultValue : selectedNumVal;
      }
      return formValue; 
    default: // Including 'file', 'text', 'textarea', 'url', 'color'
      return formValue;
  }
};

const getInitialFormValue = (property: ComponentProperty, existingProps: Record<string, any>, defaultProps: Record<string, any>): any => {
  let value = existingProps[property.name];

  if (value === undefined) {
    value = defaultProps[property.name];
  }
  
  if (value === undefined) {
    value = property.defaultValue;
  }

  if (property.type === 'select' && typeof value === 'boolean') {
    return String(value);
  }
  return value;
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

  const { control, handleSubmit, reset, watch } = useForm({});
  const prevEditingComponentIdRef = useRef<string | null | undefined>();

  useEffect(() => {
    if (editingComponent && definition) {
      if (editingComponent.id !== prevEditingComponentIdRef.current || (editingComponent && !prevEditingComponentIdRef.current)) {
        const initialFormValues: Record<string, any> = {};
        definition.properties.forEach(prop => {
          initialFormValues[prop.name] = getInitialFormValue(prop, editingComponent.props, definition.defaultProps);
        });

        if (editingComponent.type === 'ImageElement') {
             initialFormValues['src'] = (typeof editingComponent.props.src === 'string' && editingComponent.props.src.startsWith('data:image')) 
                                        ? editingComponent.props.src 
                                        : '';
        }
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
      const componentFinalProps: Record<string, any> = {};

      definition.properties.forEach(prop => {
        const formValue = data[prop.name];
        componentFinalProps[prop.name] = getCoercedValue(prop, formValue);
      });
      
      if (editingComponent.type === 'ImageElement') {
        const newFileSrc = data.src; // Value from the file input field in the form
        const existingSrc = editingComponent.props.src;
        
        // Determine if the existing source is a valid one (Data URI or HTTP URL)
        const existingValidSrc = (typeof existingSrc === 'string' && 
                                 (existingSrc.startsWith('data:image') /* || existingSrc.startsWith('http') */)) // We removed http support for src
                                 ? existingSrc
                                 : null;

        if (typeof newFileSrc === 'string' && newFileSrc.startsWith('data:image')) {
          // New file uploaded and processed to Data URI
          componentFinalProps.src = newFileSrc;
        } else if (existingValidSrc) {
          // No new valid file, but there was an existing valid src (which was a Data URI)
          componentFinalProps.src = existingValidSrc;
        } else {
          // No new valid file and no existing valid src, so use default (empty string)
          componentFinalProps.src = definition.defaultProps.src || '';
        }
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
                <FormField key={prop.name} property={prop} control={control} />
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

