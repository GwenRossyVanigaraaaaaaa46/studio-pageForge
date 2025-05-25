"use client";

import type React from 'react';
import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
  const { name, label, type, options, placeholder, defaultValue } = property;

  return (
    <div className="mb-4">
      <Label htmlFor={name} className="text-sm font-medium mb-1 block">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => {
          const fieldProps = { ...field, placeholder, id: name, value: field.value ?? '' };
          switch (type) {
            case 'text':
            case 'url':
            case 'color': // Basic text input for color, can be enhanced with a color picker
              return <Input type={type === 'color' ? 'text' : type} {...fieldProps} />;
            case 'number':
              return <Input type="number" {...fieldProps} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />;
            case 'textarea':
              return <Textarea {...fieldProps} rows={3} />;
            case 'select':
              return (
                <Select onValueChange={field.onChange} value={String(field.value)}>
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
    defaultValues: editingComponent?.props || {},
  });

  // Reset form when editingComponent changes
  useEffect(() => {
    if (editingComponent && definition) {
      const defaultValuesWithDef = { ...definition.defaultProps, ...editingComponent.props };
      reset(defaultValuesWithDef);
    } else {
      reset({});
    }
  }, [editingComponent, definition, reset]);


  // Live update props on change (debounced would be better for performance)
  const watchedValues = watch();
  useEffect(() => {
    if (editingComponent && Object.keys(watchedValues).length > 0) {
        const changedProps = { ...watchedValues };
        // Ensure numbers are numbers
        definition?.properties.forEach(prop => {
            if (prop.type === 'number' && typeof changedProps[prop.name] === 'string') {
                changedProps[prop.name] = parseFloat(changedProps[prop.name] as string) || prop.defaultValue || 0;
            }
        });
        updateComponentProps(editingComponent.id, changedProps);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, editingComponent, updateComponentProps, definition]);


  const onSubmit = (data: Record<string, any>) => {
    if (editingComponent) {
      // Ensure numbers are numbers on final submit too
      const finalData = { ...data };
      definition?.properties.forEach(prop => {
        if (prop.type === 'number' && typeof finalData[prop.name] === 'string') {
          finalData[prop.name] = parseFloat(finalData[prop.name] as string) || prop.defaultValue || 0;
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
