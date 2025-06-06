
import type { ComponentDefinition } from '@/types/page-builder';
import HeaderElement from '@/components/page-builder/elements/HeaderElement';
import TextElement from '@/components/page-builder/elements/TextElement';
import ImageElement from '@/components/page-builder/elements/ImageElement';
import DescriptionBulletElement from '@/components/page-builder/elements/DescriptionBulletElement';
import AiTextGeneratorElement from '@/components/page-builder/elements/AiTextGeneratorElement'; // Added
import { Heading1, Type, Image as ImageIcon, ListChecks, Wand2 } from 'lucide-react'; // Added Wand2

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  {
    type: 'HeaderElement',
    name: 'Header',
    icon: Heading1,
    defaultProps: {
      title: 'Main Headline',
      subtitle: 'A catchy subtitle goes here.',
      level: 1,
      alignment: 'left',
    },
    properties: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Main Headline', placeholder: 'Enter title' },
      { name: 'subtitle', label: 'Subtitle', type: 'text', defaultValue: 'A catchy subtitle.', placeholder: 'Enter subtitle (optional)' },
      {
        name: 'level',
        label: 'Heading Level',
        type: 'select',
        defaultValue: 1,
        options: [
          { label: 'H1', value: 1 },
          { label: 'H2', value: 2 },
          { label: 'H3', value: 3 },
          { label: 'H4', value: 4 },
          { label: 'H5', value: 5 },
          { label: 'H6', value: 6 },
        ],
      },
      {
        name: 'alignment',
        label: 'Alignment',
        type: 'select',
        defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
    component: HeaderElement,
  },
  {
    type: 'TextElement',
    name: 'Text Block',
    icon: Type,
    defaultProps: {
      content: 'This is a sample paragraph. Click to edit and add your own text. You can style it too!',
      fontSize: 'base',
      alignment: 'left',
    },
    properties: [
      { name: 'content', label: 'Content', type: 'textarea', defaultValue: 'This is a sample paragraph.', placeholder: 'Enter text content' },
      {
        name: 'fontSize',
        label: 'Font Size',
        type: 'select',
        defaultValue: 'base',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Base', value: 'base' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
          { label: '2X Large', value: '2xl' },
        ],
      },
      {
        name: 'alignment',
        label: 'Alignment',
        type: 'select',
        defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
          { label: 'Justify', value: 'justify' },
        ],
      },
    ],
    component: TextElement,
  },
  {
    type: 'ImageElement',
    name: 'Image',
    icon: ImageIcon,
    defaultProps: {
      src: '', 
      alt: 'My Awesome Image',
      width: 600,
      height: 400,
      objectFit: 'cover',
      alignment: 'center',
    },
    properties: [
      { name: 'src', label: 'Image File', type: 'file', defaultValue: '' },
      { name: 'alt', label: 'Alt Text', type: 'text', defaultValue: 'My Awesome Image', placeholder: 'Image description' },
      { name: 'width', label: 'Width (px)', type: 'number', defaultValue: 600, placeholder: '600' },
      { name: 'height', label: 'Height (px)', type: 'number', defaultValue: 400, placeholder: '400' },
      {
        name: 'objectFit',
        label: 'Object Fit',
        type: 'select',
        defaultValue: 'cover',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Contain', value: 'contain' },
          { label: 'Fill', value: 'fill' },
          { label: 'None', value: 'none' },
          { label: 'Scale Down', value: 'scale-down' },
        ],
      },
      {
        name: 'alignment',
        label: 'Alignment',
        type: 'select',
        defaultValue: 'center',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
    component: ImageElement,
  },
  {
    type: 'DescriptionBulletElement',
    name: 'Description & Bullets',
    icon: ListChecks,
    defaultProps: {
      description: 'This is a compelling brief description highlighting the main advantages of your product or service. You can edit this text to suit your needs.',
      bulletPointsText: "Feature 1: Describe its benefit.\nFeature 2: Another key advantage.\nFeature 3: Important detail for users.",
      alignment: 'left',
    },
    properties: [
      {
        name: 'description',
        label: 'Brief Description',
        type: 'textarea',
        defaultValue: 'This is a compelling brief description highlighting the main advantages of your product or service. You can edit this text to suit your needs.',
        placeholder: 'Enter a brief description here.',
      },
      {
        name: 'bulletPointsText',
        label: 'Bullet Points (one per line)',
        type: 'textarea',
        defaultValue: "Feature 1: Describe its benefit.\nFeature 2: Another key advantage.\nFeature 3: Important detail for users.",
        placeholder: 'Enter each bullet point on a new line.',
      },
      {
        name: 'alignment',
        label: 'Alignment',
        type: 'select',
        defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
    component: DescriptionBulletElement,
  },
  {
    type: 'AiTextGeneratorElement',
    name: 'AI Text Generator',
    icon: Wand2,
    defaultProps: {
      userProvidedPrompt: 'e.g., Write a paragraph about the benefits of learning Next.js for web development.',
      aiGeneratedText: '',
    },
    properties: [
      { 
        name: 'userProvidedPrompt', 
        label: 'Your Prompt for AI', 
        type: 'textarea', 
        defaultValue: 'e.g., Write a paragraph about the benefits of learning Next.js for web development.',
        placeholder: 'Enter your prompt for the AI here...' 
      },
      { 
        name: 'aiActionButton', // Unique name for this action button property
        label: 'Generate Text with AI', // This will be the button's text
        type: 'ai_action_button',
        promptSourceField: 'userProvidedPrompt', // Field to get prompt from
        actionTargetField: 'aiGeneratedText',   // Field to update with AI result
        buttonText: 'Generate Text with AI ✨' // Explicit button text
      },
      { 
        name: 'aiGeneratedText', 
        label: 'AI Generated Text', 
        type: 'textarea', 
        defaultValue: '', 
        placeholder: 'AI generated text will appear here after generation.' 
      },
    ],
    component: AiTextGeneratorElement,
  }
];
