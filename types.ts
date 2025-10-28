export enum View {
  Comparer = 'Comparer',
  Chat = 'Chat',
  Files = 'Files',
  History = 'History',
}

export interface Product {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ProductParameter {
    name: string;
    value: string;
    description?: string;
}

export interface ComparisonValue {
    productName: string;
    value: string;
    isBest: boolean;
}

export interface ComparisonParameter {
    name: string;
    values: ComparisonValue[];
}

export interface Technology {
    name: string;
    description: string;
}

export interface SingleProductAnalysis {
    parameters: ProductParameter[];
    summary: string;
    technologies: Technology[];
}

export interface ComparisonAnalysis {
    parameters: ComparisonParameter[];
    summary: string;
    technologies: Technology[];
    productNames: string[];
}

export interface Analysis {
    id: string;
    timestamp: string;
    prompt: string;
    response: SingleProductAnalysis | ComparisonAnalysis;
    type: 'single' | 'comparison';
}

export interface StoredFile {
    id: string;
    name: string;
    type: string;
    content: string; // base64 encoded content
}