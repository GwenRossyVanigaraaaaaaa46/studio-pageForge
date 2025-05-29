
"use client";

import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, type FieldValues, type UseFormGetValues, type UseFormSetValue, type Control } from 'react-hook-form';
import { usePageBuilder } from '@/contexts/PageBuilderContext';
import type { ComponentProperty, FormFieldProps as OriginalFormFieldProps } from '@/types/page-builder'; // Renamed to avoid conflict
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Settings, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateText, type GenerateTextInput } from '@/ai/flows/generate-text-flow';


// Extend FormFieldProps to include form's getValues and setValue for AI action button
interface FormFieldProps extends OriginalFormFieldProps {
  getValues: UseFormGetValues<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
}

const FormField: React.FC<Pick<FormFieldProps, 'property' | 'control' | 'getValues' | 'setValue'>> = ({ property, control, getValues, setValue }) => {
  const { name, label, type, options, placeholder, defaultValue, promptSourceField, actionTargetField, buttonText } = property;
  const { toast } = useToast();
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleAiAction = async () => {
    if (!promptSourceField || !actionTargetField) {
      toast({ title: "Error", description: "AI action button is misconfigured.", variant: "destructive" });
      return;
    }
    const promptValue = getValues(promptSourceField);
    if (typeof promptValue !== 'string' || !promptValue.trim()) {
      toast({ title: "Input Required", description: "Please enter a prompt for the AI.", variant: "destructive" });
      return;
    }

    setIsLoadingAi(true);
    try {
      const result = await generateText({ prompt: promptValue });
      setValue(actionTargetField, result.generatedText, { shouldDirty: true, shouldTouch: true });
      toast({ title: "AI Content Generated", description: "The AI has generated text based on your prompt." });
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast({ title: "AI Error", description: `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  if (type === 'ai_action_button') {
    return (
      <div className="mb-4">
        <Button 
          type="button" 
          onClick={handleAiAction} 
          disabled={isLoadingAi}
          className="w-full"
        >
          {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText || label || 'Generate with AI'}
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Label htmlFor={name} className="text-sm font-medium mb-1 block">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue} // Controller's own defaultValue for initialization
        render={({ field }) => {
          // Use defaultValue from property definition as fallback if field.value is undefined
          const currentValue = field.value === undefined ? defaultValue : field.value;
          const fieldProps = { ...field, placeholder, id: name, value: type === 'file' ? undefined : (currentValue ?? '') };
          
          switch (type) {
            case 'text':
            case 'url':
            case 'color':
              return <Input type={type === 'color' ? 'text' : type} {...fieldProps} />;
            case 'number':
              return <Input 
                        type="number" 
                        {...fieldProps} 
                        value={currentValue === null || currentValue === undefined || isNaN(parseFloat(currentValue as string)) ? '' : String(currentValue)}
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
                  value={String(currentValue ?? property.defaultValue ?? '')} 
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
                      // If no file is selected, or selection is cleared,
                      // we should probably set it to empty or the existing prop value.
                      // For now, let's set to empty to indicate "no new file".
                      // The onSubmit logic will handle preserving existing image if no new one is uploaded.
                      field.onChange('');
                    }
                  }}
                  // For file inputs, we don't set 'value' directly for security reasons.
                  // react-hook-form handles this. We only pass name and ref.
                  name={field.name} ref={field.ref}
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
      // Coerce string "true"/"false" from select back to boolean if defaultValue was boolean
      if (typeof property.defaultValue === 'boolean') {
        return formValue === 'true';
      }
      // Coerce string number from select back to number if defaultValue was number
      if (typeof property.defaultValue === 'number') {
        const selectedNumVal = parseFloat(formValue);
        return isNaN(selectedNumVal) ? property.defaultValue : selectedNumVal;
      }
      return formValue; 
    default: 
      return formValue;
  }
};

const getInitialFormValue = (property: ComponentProperty, existingProps: Record<string, any>, defaultProps: Record<string, any>): any => {
  let value = existingProps[property.name];

  // If value not in existing props, try from definition's defaultProps
  if (value === undefined) {
    value = defaultProps[property.name];
  }
  
  // If still undefined, use the property's own defaultValue
  if (value === undefined) {
    value = property.defaultValue;
  }

  // For select elements storing booleans, convert boolean to string for form value
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

  const { control, handleSubmit, reset, getValues, setValue, watch } = useForm({
     // No defaultValues here; we'll use reset in useEffect
  });
  
  useEffect(() => {
    if (editingComponent && definition) {
      const initialFormValues: Record<string, any> = {};
      definition.properties.forEach(prop => {
        // Skip ai_action_button types for form values
        if (prop.type === 'ai_action_button') return;

        initialFormValues[prop.name] = getInitialFormValue(prop, editingComponent.props, definition.defaultProps);
      });

      // Specific handling for ImageElement's src for file input
      if (editingComponent.type === 'ImageElement') {
           // For file inputs, the 'value' should represent the file itself or be empty.
           // We don't pre-fill file inputs with Data URIs as their 'value' attribute.
           // react-hook-form handles file input state internally.
           // The display of "current image" would be separate UI if needed, not via input's value.
           // So, `initialFormValues['src']` here should be for other components,
           // or if ImageElement `src` was non-file. We're only using file for images now.
           // Let's assume `src` for ImageElement is for the Data URI from file upload.
           // If `editingComponent.props.src` is a Data URI, it's implicitly part of `initialFormValues[prop.name]`.
      }
      reset(initialFormValues);
    } else if (!editingComponent) { 
      reset({}); // Reset to empty if no component is selected
    }
  }, [editingComponent, definition, reset]);


  const onSubmit = (data: Record<string, any>) => { 
    if (editingComponent && definition) {
      const componentFinalProps: Record<string, any> = { ...editingComponent.props }; // Start with existing props

      definition.properties.forEach(prop => {
        // Skip ai_action_button types for props storage
        if (prop.type === 'ai_action_button') return;

        const formValue = data[prop.name];
        componentFinalProps[prop.name] = getCoercedValue(prop, formValue);
      });
      
      // Specific logic for ImageElement to handle file uploads (Data URIs)
      if (editingComponent.type === 'ImageElement') {
        const formDataSrc = data.src; // This should be a Data URI from file upload if a new file was chosen
        let determinedSrc = '';

        if (typeof formDataSrc === 'string' && formDataSrc.startsWith('data:image')) {
          determinedSrc = formDataSrc; // New file uploaded
        } else if (typeof editingComponent.props.src === 'string' && editingComponent.props.src.startsWith('data:image')) {
          determinedSrc = editingComponent.props.src; // No new file, keep existing uploaded image
        }
        // If neither new nor existing data URI, src will be based on defaultValue (empty for image)
        componentFinalProps.src = determinedSrc || (definition.defaultProps?.src ?? '');
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
            {/* Use a unique key for the form to ensure it remounts when editingComponent changes */}
            <form key={editingComponent.id || 'no-component-selected'} onSubmit={handleSubmit(onSubmit)}>
              {definition.properties.map(prop => (
                <FormField 
                  key={prop.name} 
                  property={prop} 
                  control={control} 
                  getValues={getValues} 
                  setValue={setValue}
                />
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
