export function stripMarkdown(text: string): string {
    if (!text) return '';

    return text
        // Remove headers (# ## ### etc)
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic (**text** *text*)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        // Remove inline code (`code`)
        .replace(/`([^`]+)`/g, '$1')
        // Remove links ([text](url))
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images (![alt](url))
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // Remove code blocks (```code```)
        .replace(/```[\s\S]*?```/g, '')
        // Remove blockquotes (> text)
        .replace(/^>\s+/gm, '')
        // Remove lists (- item, * item, 1. item)
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // Remove multiple line breaks
        .replace(/\n\s*\n/g, '\n')
        // Remove extra whitespace
        .replace(/^\s+|\s+$/g, '')
        .trim();
}

export function createExcerpt(text: string, maxLength: number = 150): string {
    const cleanText = stripMarkdown(text);

    if (cleanText.length <= maxLength) {
        return cleanText;
    }

    // Find the last complete sentence within the limit
    const truncated = cleanText.slice(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSentence > maxLength * 0.7) {
        return cleanText.slice(0, lastSentence + 1);
    }

    if (lastSpace > maxLength * 0.8) {
        return cleanText.slice(0, lastSpace) + '...';
    }

    return truncated + '...';
} 