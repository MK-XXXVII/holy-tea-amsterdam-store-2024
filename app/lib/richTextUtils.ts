import type {RichTextNode} from './type';

export function convertRichTextToHTML(node: RichTextNode): string {
  let html = '';

  switch (node.type) {
    case 'root':
    case 'paragraph':
      const tag = node.type === 'paragraph' ? 'p' : 'div';
      html += `<${tag}>`;
      node.children?.forEach((child) => {
        html += convertRichTextToHTML(child);
      });
      html += `</${tag}>`;
      break;
    case 'text':
      let text = node.value || '';
      if (node.bold) {
        text = `<strong>${text}</strong>`;
      }
      if (node.italic) {
        text = `<em>${text}</em>`;
      }
      html += text;
      break;
    case 'link':
      const linkText = node.children?.map(convertRichTextToHTML).join('') || '';
      html += `<a href="${node.url}" title="${node.title}">${linkText}</a>`;
      break;
    case 'list':
      const listTag = node.listType === 'ordered' ? 'ol' : 'ul';
      html += `<${listTag}>`;
      node.children?.forEach((child) => {
        html += convertRichTextToHTML(child);
      });
      html += `</${listTag}>`;
      break;
    case 'list-item':
      html += '<li>';
      node.children?.forEach((child) => {
        html += convertRichTextToHTML(child);
      });
      html += '</li>';
      break;
    case 'heading':
      const headingLevel = node.level || 1; // Default to level 1 if not specified
      html += `<h${headingLevel}>`;
      node.children?.forEach((child) => {
        html += convertRichTextToHTML(child);
      });
      html += `</h${headingLevel}>`;
      break;
    default:
      console.warn(`Unhandled node type: ${node.type}`);
  }

  return html;
}
