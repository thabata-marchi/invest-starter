export class View {
    constructor() {
        this.loadTemplate = this.loadTemplate.bind(this);
    }

    async loadTemplate(templatePath) {
        const response = await fetch(templatePath);
        return await response.text();
    }

    replaceTemplate(template, data) {
        let result = template;
        for (const [key, value] of Object.entries(data)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }
}
