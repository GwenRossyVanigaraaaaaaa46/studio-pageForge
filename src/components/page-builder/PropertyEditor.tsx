
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
  const { name, label, type, options, placeholder, defaultValue } = property;

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
          const fieldProps = { ...field, placeholder, id: name, value: field.value ?? '' };
          switch (type) {
            case 'text':
            case 'url':
            case 'color': // Basic text input for color, can be enhanced with a color picker
              return <Input type={type === 'color' ? 'text' : type} {...fieldProps} />;
            case 'number':
              return <Input type="number" {...fieldProps} onChange={e => field.onChange(parseFloat(e.target.value) || (defaultValue ?? 0))} />;
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
    // Default values are primarily set by the reset effect
  });

  const prevEditingComponentIdRef = useRef<string | null | undefined>();

  // Effect to reset form when the component being edited changes
  useEffect(() => {
    if (editingComponent && definition) {
      // Only reset if the component ID actually changes, or it becomes defined/undefined,
      // or if it's the initial load for a component (prevEditingComponentIdRef.current is undefined)
      if (editingComponent.id !== prevEditingComponentIdRef.current || !prevEditingComponentIdRef.current) {
        const defaultValuesWithDef = { ...definition.defaultProps, ...editingComponent.props };
        reset(defaultValuesWithDef);
        prevEditingComponentIdRef.current = editingComponent.id;
      }
    } else if (prevEditingComponentIdRef.current) { // If component becomes null and there was a previously edited component
      reset({}); 
      prevEditingComponentIdRef.current = null;
    }
  }, [editingComponent, definition, reset]);


  // Effect for live updates.
  const watchedValues = watch();
  useEffect(() => {
    if (editingComponent && definition && Object.keys(watchedValues).length > 0) {
      const coercedProps = { ...watchedValues };

      // Coerce types (e.g., string from input to number)
      definition.properties.forEach(prop => {
        if (prop.type === 'number' && typeof coercedProps[prop.name] === 'string') {
          const numVal = parseFloat(coercedProps[prop.name] as string);
          coercedProps[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
        }
      });

      let hasChanged = false;
      const currentProps = editingComponent.props;
      const newKeys = Object.keys(coercedProps);
      const oldKeys = Object.keys(currentProps);

      if (newKeys.length !== oldKeys.length) {
        hasChanged = true;
      } else {
        for (const key of newKeys) {
          if (Number.isNaN(coercedProps[key]) && Number.isNaN(currentProps[key])) {
            continue;
          }
          if (coercedProps[key] !== currentProps[key]) {
            hasChanged = true;
            break;
          }
        }
      }

      if (hasChanged) {
        updateComponentProps(editingComponent.id, coercedProps);
      }
    }
  }, [watchedValues, editingComponent, definition, updateComponentProps]);


  const onSubmit = (data: Record<string, any>) => {
    if (editingComponent && definition) {
      const finalData = { ...data };
      definition.properties.forEach(prop => {
        if (prop.type === 'number' && typeof finalData[prop.name] === 'string') {
          const numVal = parseFloat(finalData[prop.name] as string);
          finalData[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
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
    
