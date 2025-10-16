// blog.js - Sistema de Blog SEO Otimizado
class BlogSEO {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentPage = 1;
        this.articlesPerPage = 6;
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }
    
    // Função para sanitizar HTML
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // Função para renderizar HTML de forma segura
    setSafeHTML(element, html) {
        element.innerHTML = html;
    }
    
    async init() {
        await this.loadArticles();
        this.setupEventListeners();
        this.renderBlog();
        this.generateSitemap();
        this.updateMetaTags();
    }
    
    async loadArticles() {
        try {
            // Carregar artigos do arquivo JSON
            const response = await fetch('/data/blog-articles.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar artigos');
            }
            this.articles = await response.json();
            this.filteredArticles = [...this.articles];
        } catch (error) {
            console.error('Erro ao carregar artigos:', error);
            // Fallback: artigos de exemplo
            this.articles = this.getDefaultArticles();
            this.filteredArticles = [...this.articles];
        }
    }
    
    getDefaultArticles() {
        return [
            {
                id: 1,
                title: "Marketing Blockchain: Estratégias para 2024",
                slug: "marketing-blockchain-estrategias-2024",
                excerpt: "Descubra as melhores estratégias de marketing para empresas blockchain em 2024. Cases reais e táticas comprovadas para crescimento exponencial.",
                content: "Conteúdo completo do artigo sobre marketing blockchain...",
                date: "2024-01-15",
                category: "marketing",
                tags: ["blockchain", "marketing", "estratégia", "2024"],
                meta: {
                    description: "Estratégias comprovadas de marketing blockchain para empresas inovadoras em 2024",
                    keywords: "marketing blockchain, estratégias digitais, crescimento empresarial, consultoria marketing"
                },
                readTime: "8 min",
                author: "MELLØ™",
                featured: true
            },
            {
                id: 2,
                title: "Como Implementar PWA com Service Workers",
                slug: "implementar-pwa-service-workers",
                excerpt: "Guia completo para implementar Progressive Web Apps com Service Workers. Performance, offline-first e experiência mobile otimizada.",
                content: "Conteúdo completo sobre implementação de PWA...",
                date: "2024-01-12",
                category: "tecnologia",
                tags: ["pwa", "service workers", "javascript", "web development"],
                meta: {
                    description: "Guia completo para implementar PWA com Service Workers e otimizar performance",
                    keywords: "pwa, service workers, web development, performance, mobile"
                },
                readTime: "12 min",
                author: "MELLØ™",
                featured: false
            },
            {
                id: 3,
                title: "Estratégias de Crescimento para Startups Blockchain",
                slug: "estrategias-crescimento-startups-blockchain",
                excerpt: "Como startups blockchain podem acelerar seu crescimento com estratégias de marketing digital e desenvolvimento de produto.",
                content: "Conteúdo completo sobre estratégias de crescimento...",
                date: "2024-01-10",
                category: "estrategia",
                tags: ["startups", "blockchain", "crescimento", "marketing digital"],
                meta: {
                    description: "Estratégias de crescimento para startups blockchain e marketing digital",
                    keywords: "startups blockchain, crescimento, marketing digital, estratégias"
                },
                readTime: "10 min",
                author: "MELLØ™",
                featured: true
            },
            {
                id: 4,
                title: "Tendências de Marketing Digital em 2024",
                slug: "tendencias-marketing-digital-2024",
                excerpt: "As principais tendências de marketing digital que vão dominar 2024. IA, automação e personalização em massa.",
                content: "Conteúdo completo sobre tendências de marketing...",
                date: "2024-01-08",
                category: "marketing",
                tags: ["marketing digital", "tendências", "2024", "ia", "automação"],
                meta: {
                    description: "Principais tendências de marketing digital para 2024",
                    keywords: "marketing digital, tendências, 2024, ia, automação"
                },
                readTime: "6 min",
                author: "MELLØ™",
                featured: false
            },
            {
                id: 5,
                title: "Desenvolvimento de Sistemas Descentralizados",
                slug: "desenvolvimento-sistemas-descentralizados",
                excerpt: "Como desenvolver sistemas descentralizados robustos e escaláveis. Arquitetura, segurança e melhores práticas.",
                content: "Conteúdo completo sobre desenvolvimento descentralizado...",
                date: "2024-01-05",
                category: "blockchain",
                tags: ["descentralização", "blockchain", "desenvolvimento", "arquitetura"],
                meta: {
                    description: "Guia para desenvolvimento de sistemas descentralizados robustos",
                    keywords: "descentralização, blockchain, desenvolvimento, arquitetura"
                },
                readTime: "15 min",
                author: "MELLØ™",
                featured: true
            },
            {
                id: 6,
                title: "Consultoria em Marketing: Cases de Sucesso",
                slug: "consultoria-marketing-cases-sucesso",
                excerpt: "Cases reais de consultoria em marketing que geraram resultados excepcionais. Metodologias e estratégias comprovadas.",
                content: "Conteúdo completo sobre cases de sucesso...",
                date: "2024-01-03",
                category: "estrategia",
                tags: ["consultoria", "marketing", "cases", "resultados"],
                meta: {
                    description: "Cases reais de consultoria em marketing com resultados excepcionais",
                    keywords: "consultoria marketing, cases, resultados, estratégias"
                },
                readTime: "7 min",
                author: "MELLØ™",
                featured: false
            }
        ];
    }
    
    setupEventListeners() {
        // Filtros por categoria
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;
                this.updateActiveTab(e.target);
                this.filterArticles();
                this.renderBlog();
            });
        });
        
        // Busca
        const searchInput = document.getElementById('blog-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.filterArticles();
                this.renderBlog();
            });
        }
    }
    
    updateActiveTab(activeTab) {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        activeTab.classList.add('active');
    }
    
    filterArticles() {
        this.filteredArticles = this.articles.filter(article => {
            const matchesCategory = this.currentCategory === 'all' || article.category === this.currentCategory;
            const matchesSearch = this.searchQuery === '' || 
                article.title.toLowerCase().includes(this.searchQuery) ||
                article.excerpt.toLowerCase().includes(this.searchQuery) ||
                article.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
            
            return matchesCategory && matchesSearch;
        });
    }
    
    renderBlog() {
        const container = document.getElementById('articles-container');
        if (!container) return;
        
        // Calcular artigos para a página atual
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);
        
        if (articlesToShow.length === 0) {
            this.setSafeHTML(container, `
                <div class="no-articles">
                    <h3>Nenhum artigo encontrado</h3>
                    <p>Tente ajustar os filtros ou termos de busca.</p>
                </div>
            `);
            return;
        }
        
        // Renderizar artigos
        this.setSafeHTML(container, `
            <div class="article-grid">
                ${articlesToShow.map(article => this.renderArticle(article)).join('')}
            </div>
        `);
        
        // Renderizar paginação
        this.renderPagination();
    }
    
    renderArticle(article) {
        const formattedDate = new Date(article.date).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const imageHTML = article.image ? 
            `<div class="post-image">
                <img src="${article.image}" alt="${article.title}" itemprop="image" loading="lazy">
            </div>` : '';
        
        return `
            <article class="blog-post" itemscope itemtype="https://schema.org/BlogPosting">
                ${imageHTML}
                <header class="post-header">
                    <h2 class="post-title" itemprop="headline">${article.title}</h2>
                    <div class="post-meta">
                        <time class="post-date" itemprop="datePublished" datetime="${article.date}">
                            📅 ${formattedDate}
                        </time>
                        <span class="post-read-time">⏱️ ${article.readTime}</span>
                        <span class="post-author">👤 ${article.author}</span>
                    </div>
                    <div class="post-category">${this.getCategoryLabel(article.category)}</div>
                </header>
                <div class="post-content">
                    <p class="post-excerpt" itemprop="description">${article.excerpt}</p>
                    <div class="post-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="/blog/${article.slug}" class="read-more" itemprop="url">
                        Ler mais →
                    </a>
                </div>
            </article>
        `;
    }
    
    getCategoryLabel(category) {
        const labels = {
            'marketing': 'Marketing',
            'blockchain': 'Blockchain',
            'tecnologia': 'Tecnologia',
            'estrategia': 'Estratégia'
        };
        return labels[category] || category;
    }
    
    renderPagination() {
        const container = document.getElementById('pagination-container');
        if (!container) return;
        
        const totalPages = Math.ceil(this.filteredArticles.length / this.articlesPerPage);
        
        if (totalPages <= 1) {
            this.setSafeHTML(container, '');
            return;
        }
        
        let paginationHTML = '';
        
        // Botão anterior
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="blogSEO.goToPage(${this.currentPage - 1})">
                ← Anterior
            </button>
        `;
        
        // Números das páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="blogSEO.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Botão próximo
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="blogSEO.goToPage(${this.currentPage + 1})">
                Próximo →
            </button>
        `;
        
        this.setSafeHTML(container, paginationHTML);
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredArticles.length / this.articlesPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderBlog();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    generateSitemap() {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://neo-flowoff.netlify.app/blog</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    ${this.articles.map(article => `
    <url>
        <loc>https://neo-flowoff.netlify.app/blog/${article.slug}</loc>
        <lastmod>${article.date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;
        
        // Salvar sitemap (em produção, isso seria feito no servidor)
        this.saveSitemap(sitemap);
    }
    
    saveSitemap(sitemap) {
        // Em produção, isso seria salvo no servidor
        console.log('Sitemap gerado:', sitemap);
    }
    
    updateMetaTags() {
        // Atualizar meta tags dinamicamente
        document.title = `Blog | FlowOFF - Marketing Blockchain e Estratégias Digitais`;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = `Blog especializado em marketing digital, blockchain e estratégias de crescimento para empresas inovadoras. ${this.articles.length}+ artigos com cases reais e táticas comprovadas.`;
        }
    }
}

// Inicializar blog globalmente
let blogSEO;

// Exportar para uso global
window.BlogSEO = BlogSEO;
window.blogSEO = blogSEO;

// Auto-inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    blogSEO = new BlogSEO();
    window.blogSEO = blogSEO;
});
