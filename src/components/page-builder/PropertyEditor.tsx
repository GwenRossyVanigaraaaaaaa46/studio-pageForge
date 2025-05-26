
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
          // For file inputs, the value should be managed by the input itself, not pre-filled by field.value
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
                  accept="image/*" // Only accept image files
                  // Remove field.value here as it's not standard for file inputs
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        field.onChange(reader.result as string); // Store Data URI
                      };
                      reader.readAsDataURL(file);
                    } else {
                      field.onChange(''); // Clear if no file selected
                    }
                  }}
                  // Omit value prop from fieldProps for file input
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
  
  const definition = editingComponent ? getComponentDefinition(editingComponent.type) : null;

  const { control, handleSubmit, reset, watch } = useForm({});

  const prevEditingComponentIdRef = useRef<string | null | undefined>();

  useEffect(() => {
    if (editingComponent && definition) {
      if (editingComponent.id !== prevEditingComponentIdRef.current || !prevEditingComponentIdRef.current) {
        let initialFormValues = { ...definition.defaultProps, ...editingComponent.props };
        if (definition.type === 'ImageElement') {
          // If src is an HTTP/S URL, populate imageUrl field, otherwise clear it
          const currentSrc = editingComponent.props.src;
          if (typeof currentSrc === 'string' && (currentSrc.startsWith('http://') || currentSrc.startsWith('https://'))) {
            initialFormValues.imageUrl = currentSrc;
            // Do not set initialFormValues.src to the URL if it's a file input representation
            // The `src` prop in editingComponent.props IS the source of truth.
            // If it was a URL, it will be in imageUrl. If it was a DataURI, it's in initialFormValues.src.
          } else {
            initialFormValues.imageUrl = ''; // Clear if src is not a URL (e.g., it's a Data URI or empty)
          }
           // if src is a dataURI, it's already in initialFormValues.src from spread
        }
        reset(initialFormValues);
        prevEditingComponentIdRef.current = editingComponent.id;
      }
    } else if (prevEditingComponentIdRef.current || (!editingComponent && isPropertyEditorPanelOpen)) { 
      reset({}); 
      prevEditingComponentIdRef.current = null;
    }
  }, [editingComponent, definition, reset, isPropertyEditorPanelOpen]);


  const watchedValues = watch();
  useEffect(() => {
    if (editingComponent && definition && Object.keys(watchedValues).length > 0) {
      const coercedProps: Record<string, any> = { ...watchedValues };

      definition.properties.forEach(prop => {
        const formValue = watchedValues[prop.name];
        
        if (formValue === undefined || formValue === null) { 
            coercedProps[prop.name] = formValue;
            return;
        }
        // For file types, the value is already a Data URI string or empty string
        if (prop.type === 'file') {
          coercedProps[prop.name] = formValue;
          return;
        }

        if (prop.type === 'number') {
          if (typeof formValue === 'string') {
            const numVal = parseFloat(formValue);
            coercedProps[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
          } else if (typeof formValue === 'number') {
            coercedProps[prop.name] = formValue; 
          } else {
             coercedProps[prop.name] = (prop.defaultValue ?? 0); 
          }
        } else if (prop.type === 'select' && typeof prop.defaultValue === 'number') {
          if (typeof formValue === 'string') {
            const numVal = parseInt(formValue, 10);
            coercedProps[prop.name] = isNaN(numVal) ? prop.defaultValue : numVal;
          } else if (typeof formValue === 'number') {
            coercedProps[prop.name] = formValue; 
          } else {
            coercedProps[prop.name] = prop.defaultValue; 
          }
        }
      });
      
      let propsAreDifferent = false;
      const currentProps = editingComponent.props;
      const relevantCoercedProps: Record<string, any> = {};
      const finalComponentProps: Record<string, any> = {}; // Props to be stored for the component

      if (definition.type === 'ImageElement') {
        // Prioritize imageUrl if present, otherwise use src (from file upload)
        if (coercedProps.imageUrl && typeof coercedProps.imageUrl === 'string' && coercedProps.imageUrl.trim() !== '') {
          finalComponentProps.src = coercedProps.imageUrl;
        } else if (coercedProps.src && typeof coercedProps.src === 'string' && (coercedProps.src.startsWith('data:image') || coercedProps.src === '')) {
          finalComponentProps.src = coercedProps.src;
        } else {
          finalComponentProps.src = currentProps.src || ''; // Fallback to existing or empty
        }
        // Include other ImageElement props
        finalComponentProps.alt = coercedProps.alt ?? definition.defaultProps.alt;
        finalComponentProps.width = coercedProps.width ?? definition.defaultProps.width;
        finalComponentProps.height = coercedProps.height ?? definition.defaultProps.height;
        finalComponentProps.objectFit = coercedProps.objectFit ?? definition.defaultProps.objectFit;

        // Check for differences against currentProps
        for (const key of Object.keys(finalComponentProps)) {
          if (finalComponentProps[key] !== currentProps[key]) {
            propsAreDifferent = true;
            break;
          }
        }
         // Check if keys in currentProps were removed (e.g. src cleared)
        if (!propsAreDifferent && Object.keys(currentProps).some(k => !finalComponentProps.hasOwnProperty(k) && currentProps[k])) {
            propsAreDifferent = true;
        }


      } else { // For other component types
        for (const prop of definition.properties) {
          const key = prop.name;
          let valFromForm = coercedProps[key];
          let valFromState = currentProps[key];
          
          if ((valFromForm === undefined || valFromForm === null || valFromForm === '') && (valFromState === undefined || valFromState === null || valFromState === '')) {
               // Both are effectively "empty"
          } else if (valFromForm !== valFromState) {
            propsAreDifferent = true;
          }
          finalComponentProps[key] = valFromForm;
        }
        if (!propsAreDifferent && Object.keys(currentProps).some(k => !finalComponentProps.hasOwnProperty(k) && currentProps[k])) {
            propsAreDifferent = true;
        }
      }
      
      if (propsAreDifferent) {
        updateComponentProps(editingComponent.id, finalComponentProps);
      }
    }
  }, [watchedValues, editingComponent, definition, updateComponentProps, reset]);


  const onSubmit = (data: Record<string, any>) => { // Manual submit (if we had a save button)
    if (editingComponent && definition) {
      const finalData: Record<string, any> = {};

      if (definition.type === 'ImageElement') {
        if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() !== '') {
          finalData.src = data.imageUrl;
        } else if (data.src && typeof data.src === 'string' && data.src.startsWith('data:image')) {
          finalData.src = data.src;
        } else {
          finalData.src = editingComponent.props.src || ''; // fallback
        }
        finalData.alt = data.alt ?? definition.defaultProps.alt;
        finalData.width = data.width ?? definition.defaultProps.width;
        finalData.height = data.height ?? definition.defaultProps.height;
        finalData.objectFit = data.objectFit ?? definition.defaultProps.objectFit;
      } else {
        definition.properties.forEach(prop => {
          const formValue = data[prop.name];
           if (formValue === undefined || formValue === null) {
              finalData[prop.name] = formValue; 
              return;
          }
          if (prop.type === 'file') { // Should be Data URI string
             finalData[prop.name] = formValue;
             return;
          }

          if (prop.type === 'number') {
             if (typeof formValue === 'string') {
              const numVal = parseFloat(formValue);
              finalData[prop.name] = isNaN(numVal) ? (prop.defaultValue ?? 0) : numVal;
            } else {
              finalData[prop.name] = formValue; 
            }
          } else if (prop.type === 'select' && typeof prop.defaultValue === 'number') {
            if (typeof formValue === 'string') {
              const numVal = parseInt(formValue, 10);
              finalData[prop.name] = isNaN(numVal) ? prop.defaultValue : numVal;
            } else {
              finalData[prop.name] = formValue; 
            }
          } else {
              finalData[prop.name] = formValue;
          }
        });
      }
      updateComponentProps(editingComponent.id, finalData);
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
          {/* The form submits on change due to the useEffect watching `watchedValues` */}
          {/* Explicit onSubmit is mostly for if we had a manual "Save" button */}
          <form onSubmit={handleSubmit(onSubmit)} onChange={() => handleSubmit(onSubmit)()}>
            {definition.properties.map(prop => (
              <FormField key={prop.name} property={prop} control={control} form={{control, handleSubmit, reset, watch} as any} />
            ))}
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PropertyEditor;
