// Structured data for the home page
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://usmanishaq.com/#person",
      "name": "Usman Ishaq",
      "jobTitle": "Semantic SEO Strategist and Consultant",
      "url": "https://usmanishaq.com/",
      "worksFor": { "@id": "https://digitalvikingz.com/#organization" },
      "knowsAbout": ["Semantic SEO","Topical Authority","Topical Maps","Entity SEO","Schema Markup","Local SEO","Google Business Profile","AI Search Visibility","Content Strategy","Website Development"],
      "alumniOf": { "@type": "CollegeOrUniversity", "name": "University of Engineering and Technology, Taxila" },
      "sameAs": [
        "https://www.linkedin.com/in/usmanishaqseo/",
        "https://www.upwork.com/freelancers/usmanishaq",
        "https://www.facebook.com/usmanishaq9380/",
        "https://ka.gravatar.com/usmanishaqsemanticseospecialist",
        "https://www.youtube.com/@UsmanSemanticSEOStrategist",
        "https://www.instagram.com/usmanishaqsemanticseo/",
        "https://medium.com/@usmanishaq"
      ]
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://digitalvikingz.com/#organization",
      "name": "Digital Vikingz",
      "url": "https://digitalvikingz.com/",
      "email": "contact@usmanishaq.com",
      "telephone": "+1-608-360-1290",
      "founder": { "@id": "https://usmanishaq.com/#person" },
      "areaServed": ["United States","United Kingdom","Canada","Australia","United Arab Emirates","Germany"],
      "serviceType": ["Semantic SEO","Topical Map Creation","Semantic Content Writing","Website Design and Development","Technical SEO","Schema Markup","Local SEO","AI Search Visibility","Social Media Management"]
    },
    {
      "@type": "WebSite",
      "@id": "https://usmanishaq.com/#website",
      "url": "https://usmanishaq.com/",
      "name": "Usman Ishaq",
      "publisher": { "@id": "https://usmanishaq.com/#person" }
    }
  ]
};

export const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is semantic SEO, in plain words?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It means building your site around things and how they connect, not around single keywords. Your business, your services, your towns and the questions customers ask all become clear entities with clear links between them. Google reads that structure and understands what you do and where."
      }
    },
    {
      "@type": "Question",
      "name": "How is this different from the SEO I paid for before?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most SEO packages add posts, links and a monthly report on top of the same site. I start with the structure. If Google cannot tell which page answers which question, more content only adds noise."
      }
    },
    {
      "@type": "Question",
      "name": "Do you guarantee first page rankings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Nobody controls Google, and anyone who promises a position is guessing. What I can promise is a site Google can read, a plan you can check page by page, and reports in calls and booked jobs."
      }
    },
    {
      "@type": "Question",
      "name": "How long until new town pages bring calls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A few months is normal for new pages. It depends on your competition, your current site and how much proof you can give. I give you an honest range on the call, before we talk about price."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need a new website?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not always. Sometimes a rebuild of the structure, content and schema on your current site is enough. Sometimes the old site costs more to fix than to replace. The audit tells us which."
      }
    },
    {
      "@type": "Question",
      "name": "Which platforms do you build on?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WordPress, Elementor, Shopify and Next.js. I pick the one that fits your business and how your team will edit the site, not the one that is easiest for me."
      }
    },
    {
      "@type": "Question",
      "name": "Will my site show up in ChatGPT and Google AI answers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI answers pull from sources they can understand and trust. Clear entities, direct answers and consistent facts across your site, Business Profile and listings make you easier to cite. It is the same structural work, pointed at a new kind of reader."
      }
    },
    {
      "@type": "Question",
      "name": "What do you need from me?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Real answers. Your services, the towns you cover, the jobs you want more of, and the questions customers ask on the phone. The best pages are built from what you already know."
      }
    },
    {
      "@type": "Question",
      "name": "How do you report results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Calls, quote requests, form leads and booked jobs first. Rankings and traffic sit underneath as the reason those numbers moved."
      }
    },
    {
      "@type": "Question",
      "name": "Do you work with agencies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Topical maps, briefs and semantic content can be delivered white-label under your brand."
      }
    },
    {
      "@type": "Question",
      "name": "Who actually does the work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "I set the strategy and the topical map. My team at Digital Vikingz builds, writes and configures it, and I review the work before it goes live."
      }
    },
    {
      "@type": "Question",
      "name": "Which countries do you serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mostly the USA, UK, Canada, Australia, UAE and Germany. Content is written for your local market, spelling and search habits."
      }
    }
  ]
};
