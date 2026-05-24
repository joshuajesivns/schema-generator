import { useState, useMemo } from 'react'
import './App.css'

type SchemaType = 'LOCAL_BUSINESS' | 'SERVICE' | 'PRODUCT' | 'ARTICLE' | 'FAQ' | 'CITY_PAGE' | 'PERSON';

interface FAQItem { question: string; answer: string; }
interface ReviewItem { authorName: string; reviewRating: string; reviewBody: string; datePublished: string; }
interface Location { name: string; streetAddress: string; addressLocality: string; addressRegion: string; postalCode: string; telephone: string; url: string; latitude?: string; longitude?: string; mapUrl?: string; }

interface FormData {
  id?: string; name?: string; url?: string; image?: string; description?: string; alternateNames?: string;
  sameAs?: string; knowsAbout?: string; awards?: string; telephone?: string; priceRange?: string;
  paymentAccepted?: string; currenciesAccepted?: string; knowsLanguage?: string; foundingDate?: string;
  founderName?: string; founderKnowsAbout?: string; founderLocality?: string; founderRegion?: string;
  foundingLocality?: string; foundingRegion?: string; logo?: string; disambiguatingDescription?: string;
  hasMap?: string; streetAddress?: string; addressLocality?: string; addressRegion?: string;
  postalCode?: string; addressCountry?: string; latitude?: string; longitude?: string; geoRadius?: string;
  locations?: Location[]; headline?: string; authorName?: string; authorJobTitle?: string;
  authorAlumniOf?: string; authorSameAs?: string; publisherName?: string; publisherLogo?: string;
  datePublished?: string; dateModified?: string; mainEntityOfPage?: string; brandName?: string;
  brandSameAs?: string; price?: string; priceCurrency?: string; availability?: string;
  ratingValue?: string; ratingCount?: string; sku?: string; gtin?: string; mpn?: string; model?: string;
  serviceType?: string; providerName?: string; areaServed?: string; offerCatalog?: string;
  audience?: string; serviceOutput?: string; jobTitle?: string; alumniOf?: string;
  openingDays?: string[]; opens?: string; closes?: string; satSunOpens?: string; satSunCloses?: string;
  contactType?: string; faqs?: FAQItem[]; reviews?: ReviewItem[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INITIAL_DATA: Record<SchemaType, FormData> = {
  LOCAL_BUSINESS: { 
    name: '', url: '', telephone: '', streetAddress: '', addressLocality: '', addressRegion: '', postalCode: '',
    addressCountry: 'US', priceRange: '$$$$', paymentAccepted: 'Cash, Credit Card', currenciesAccepted: 'USD',
    knowsLanguage: 'en', openingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:00', closes: '17:00', satSunOpens: '00:00', satSunCloses: '00:00',
    locations: [], reviews: [], alternateNames: '', geoRadius: '16093', contactType: 'customer support'
  },
  SERVICE: { name: '', description: '', serviceType: '', providerName: '', areaServed: '', url: '', offerCatalog: '', reviews: [] },
  PRODUCT: { name: '', description: '', brandName: '', price: '', priceCurrency: 'USD', availability: 'https://schema.org/InStock', reviews: [] },
  ARTICLE: { headline: '', authorName: '', datePublished: new Date().toISOString().split('T')[0], url: '' },
  FAQ: { faqs: [{ question: '', answer: '' }] },
  CITY_PAGE: { name: '', description: '', serviceType: '', areaServed: '', streetAddress: '', addressLocality: '', addressRegion: '', postalCode: '', faqs: [{ question: '', answer: '' }] },
  PERSON: { name: '', jobTitle: '', url: '', sameAs: '' }
};

function App() {
  const [schemaType, setSchemaType] = useState<SchemaType>('LOCAL_BUSINESS');
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA['LOCAL_BUSINESS']);
  const [copyStatus, setCopyStatus] = useState<'Copy' | 'Copied!'>('Copy');

  const handleTypeChange = (type: SchemaType) => { setSchemaType(type); setFormData(INITIAL_DATA[type]); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleDayToggle = (day: string) => { const current = formData.openingDays || []; const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day]; setFormData(prev => ({ ...prev, openingDays: next })); };

  const updateFaq = (index: number, field: keyof FAQItem, value: string) => { const newFaqs = [...(formData.faqs || [])]; newFaqs[index] = { ...newFaqs[index], [field]: value }; setFormData(prev => ({ ...prev, faqs: newFaqs })); };
  const addFaq = () => setFormData(prev => ({ ...prev, faqs: [...(prev.faqs || []), { question: '', answer: '' }] }));
  const removeFaq = (index: number) => setFormData(prev => ({ ...prev, faqs: (prev.faqs || []).filter((_, i) => i !== index) }));

  const updateReview = (index: number, field: keyof ReviewItem, value: string) => { const newReviews = [...(formData.reviews || [])]; newReviews[index] = { ...newReviews[index], [field]: value }; setFormData(prev => ({ ...prev, reviews: newReviews })); };
  const addReview = () => setFormData(prev => ({ ...prev, reviews: [...(prev.reviews || []), { authorName: '', reviewRating: '5', reviewBody: '', datePublished: new Date().toISOString().split('T')[0] }] }));
  const removeReview = (index: number) => setFormData(prev => ({ ...prev, reviews: (prev.reviews || []).filter((_, i) => i !== index) }));

  const addLocation = () => setFormData(prev => ({ ...prev, locations: [...(prev.locations || []), { name: '', streetAddress: '', addressLocality: '', addressRegion: '', postalCode: '', telephone: '', url: '' }] }));
  const removeLocation = (index: number) => setFormData(prev => ({ ...prev, locations: (prev.locations || []).filter((_, i) => i !== index) }));
  const updateLocation = (index: number, field: keyof Location, value: string) => { const newLocs = [...(formData.locations || [])]; newLocs[index] = { ...newLocs[index], [field]: value }; setFormData(prev => ({ ...prev, locations: newLocs })); };

  const generatedJsonLd = useMemo(() => {
    const splitAndClean = (str?: string) => str ? str.split(',').map(s => s.trim()).filter(s => s) : undefined;
    const buildAddress = (d: any) => ({ "@type": "PostalAddress", "streetAddress": d.streetAddress, "addressLocality": d.addressLocality, "addressRegion": d.addressRegion, "postalCode": d.postalCode, "addressCountry": "US" });
    const buildFaqList = (faqs: FAQItem[]) => faqs.filter(f => f.question && f.answer).map(f => ({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } }));
    const buildReviewList = (reviews: ReviewItem[]) => reviews.filter(r => r.authorName && r.reviewBody).map(r => ({ "@type": "Review", "author": { "@type": "Person", "name": r.authorName }, "reviewBody": r.reviewBody, "reviewRating": { "@type": "Rating", "ratingValue": r.reviewRating, "bestRating": "5" }, "datePublished": r.datePublished }));

    let output: any = { "@context": "https://schema.org" };

    if (schemaType === 'CITY_PAGE') {
      output = [
        { "@context": "https://schema.org", "@type": "LocalBusiness", "@id": formData.url + "#business", "name": formData.name, "description": formData.description, "address": buildAddress(formData), "areaServed": splitAndClean(formData.areaServed), "hasMap": formData.hasMap },
        { "@context": "https://schema.org", "@type": "Service", "name": formData.serviceType || formData.name, "provider": { "@id": formData.url + "#business" }, "areaServed": splitAndClean(formData.areaServed) },
        { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": buildFaqList(formData.faqs || []) }
      ];
    } else if (schemaType === 'LOCAL_BUSINESS') {
      output["@type"] = "LocalBusiness";
      if (formData.url) output["@id"] = formData.url + "#business";
      output["name"] = formData.name;
      output["url"] = formData.url;
      if (formData.alternateNames) output["alternateName"] = splitAndClean(formData.alternateNames);
      output["description"] = formData.description;
      output["disambiguatingDescription"] = formData.disambiguatingDescription;
      output["hasMap"] = formData.hasMap;
      output["priceRange"] = formData.priceRange;
      if (formData.paymentAccepted) output["paymentAccepted"] = splitAndClean(formData.paymentAccepted);
      if (formData.currenciesAccepted) output["currenciesAccepted"] = formData.currenciesAccepted;
      output["address"] = { ...buildAddress(formData), "name": formData.name, "telephone": formData.telephone };
      if (formData.founderName) output["Founder"] = { "@type": "Person", "name": formData.founderName, "knowsAbout": splitAndClean(formData.founderKnowsAbout), "workLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": formData.founderLocality, "addressRegion": formData.founderRegion } } };
      if (formData.foundingLocality) output["foundingLocation"] = { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": formData.foundingLocality, "addressRegion": formData.foundingRegion } };
      const specs = [];
      if (formData.openingDays?.length) {
        specs.push({ "@type": "OpeningHoursSpecification", "dayOfWeek": formData.openingDays, "opens": formData.opens, "closes": formData.closes });
        const others = DAYS.filter(d => !formData.openingDays?.includes(d));
        if (others.length > 0) specs.push({ "@type": "OpeningHoursSpecification", "dayOfWeek": others, "opens": formData.satSunOpens, "closes": formData.satSunCloses });
      }
      output["openingHoursSpecification"] = specs;
      if (formData.latitude && formData.longitude) output["areaServed"] = { "@type": "GeoCircle", "geoMidpoint": { "@type": "GeoCoordinates", "latitude": formData.latitude, "longitude": formData.longitude }, "geoRadius": formData.geoRadius };
      output["ContactPoint"] = { "@type": "ContactPoint", "name": formData.name, "availableLanguage": formData.knowsLanguage, "telephone": formData.telephone, "areaserved": splitAndClean(formData.areaServed), "contactType": formData.contactType };
      output["potentialAction"] = { "@type": "InteractAction", "result": { "@type": "OfferCatalog", "name": splitAndClean(formData.offerCatalog) }, "participant": { "@type": "Organization", "name": formData.name, "url": formData.url, "sameAs": splitAndClean(formData.sameAs) } };
      if (formData.locations && formData.locations.length > 0) {
        output["location"] = formData.locations.map(loc => ({ "@type": "LocalBusiness", "name": loc.name || formData.name, "address": buildAddress(loc), "telephone": loc.telephone, "url": loc.url, "hasMap": loc.mapUrl }));
      }
    } else if (schemaType === 'SERVICE') {
        output["@type"] = "Service"; output["name"] = formData.name; output["serviceType"] = formData.serviceType; output["description"] = formData.description; output["provider"] = { "@type": "LocalBusiness", "name": formData.providerName }; output["areaServed"] = splitAndClean(formData.areaServed);
        if (formData.audience) output["audience"] = { "@type": "Audience", "audienceType": formData.audience };
        if (formData.offerCatalog) output["hasOfferCatalog"] = { "@type": "OfferCatalog", "name": formData.name + " Catalog", "itemListElement": splitAndClean(formData.offerCatalog)?.map(i => ({ "@type": "Offer", "itemOffered": { "@type": "Service", "name": i } })) };
        if (formData.reviews?.length) output["review"] = buildReviewList(formData.reviews);
    } else if (schemaType === 'PRODUCT') {
        output["@type"] = "Product"; output["name"] = formData.name; output["description"] = formData.description; output["brand"] = { "@type": "Brand", "name": formData.brandName }; output["sku"] = formData.sku; output["gtin"] = formData.gtin; output["offers"] = { "@type": "Offer", "price": formData.price, "priceCurrency": formData.priceCurrency, "availability": formData.availability };
        if (formData.reviews?.length) output["review"] = buildReviewList(formData.reviews);
    } else if (schemaType === 'ARTICLE') {
        output["@type"] = "Article"; output["headline"] = formData.headline; output["author"] = { "@type": "Person", "name": formData.authorName, "jobTitle": formData.authorJobTitle, "sameAs": splitAndClean(formData.authorSameAs) }; output["datePublished"] = formData.datePublished; output["url"] = formData.url; output["publisher"] = { "@type": "Organization", "name": formData.publisherName, "logo": { "@type": "ImageObject", "url": formData.publisherLogo } };
    } else if (schemaType === 'PERSON') {
        output["@type"] = "Person"; output["name"] = formData.name; output["jobTitle"] = formData.jobTitle; output["url"] = formData.url; output["sameAs"] = splitAndClean(formData.sameAs); output["knowsAbout"] = splitAndClean(formData.knowsAbout);
    } else if (schemaType === 'FAQ') {
        output["@type"] = "FAQPage"; output["mainEntity"] = buildFaqList(formData.faqs || []);
    }

    return JSON.stringify(output, null, 2);
  }, [schemaType, formData]);

  const copyToClipboard = () => { const script = `<script type="application/ld+json">\n${generatedJsonLd}\n</script>`; navigator.clipboard.writeText(script); setCopyStatus('Copied!'); setTimeout(() => setCopyStatus('Copy'), 2000); };

  return (
    <div className="app-container">
      <header className="app-header"><h1>SchemaPro <span>Elite AI</span></h1><div className="type-selector">{(['LOCAL_BUSINESS', 'SERVICE', 'PRODUCT', 'ARTICLE', 'FAQ', 'CITY_PAGE', 'PERSON'] as SchemaType[]).map(type => (<button key={type} className={schemaType === type ? 'active' : ''} onClick={() => handleTypeChange(type)}>{type.replace('_', ' ')}</button>))}</div></header>
      <main className="main-content">
        <section className="editor-panel">
          {schemaType === 'LOCAL_BUSINESS' && (
            <div className="form-sections">
              <div className="form-section"><h3>Core Identity</h3><div className="form-grid"><label>Business Name</label><input name="name" value={formData.name} onChange={handleInputChange} /><label>URL</label><input name="url" value={formData.url} onChange={handleInputChange} /><label>Alternate Names (comma)</label><input name="alternateNames" value={formData.alternateNames} onChange={handleInputChange} /></div></div>
              <div className="form-section"><h3>Business Details</h3><div className="form-grid"><textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} /><div className="row"><input name="priceRange" placeholder="$$$$" value={formData.priceRange} onChange={handleInputChange} /><input name="currenciesAccepted" placeholder="USD" value={formData.currenciesAccepted} onChange={handleInputChange} /></div><input name="paymentAccepted" placeholder="Cash, Credit Card" value={formData.paymentAccepted} onChange={handleInputChange} /></div></div>
              <div className="form-section"><h3>Location & Geo</h3><div className="form-grid"><input name="telephone" placeholder="Phone" value={formData.telephone} onChange={handleInputChange} /><input name="hasMap" placeholder="Map URL" value={formData.hasMap} onChange={handleInputChange} /><input name="streetAddress" placeholder="Street" value={formData.streetAddress} onChange={handleInputChange} /><div className="row"><input name="addressLocality" placeholder="City" value={formData.addressLocality} onChange={handleInputChange} /><input name="addressRegion" placeholder="State" value={formData.addressRegion} onChange={handleInputChange} /><input name="postalCode" placeholder="ZIP" value={formData.postalCode} onChange={handleInputChange} /></div><div className="row"><input name="latitude" placeholder="Lat" value={formData.latitude} onChange={handleInputChange} /><input name="longitude" placeholder="Long" value={formData.longitude} onChange={handleInputChange} /><input name="geoRadius" placeholder="Radius" value={formData.geoRadius} onChange={handleInputChange} /></div></div></div>
              <div className="form-section"><h3>Founder & E-A-T</h3><div className="form-grid"><input name="founderName" placeholder="Founder Name" value={formData.founderName} onChange={handleInputChange} /><textarea name="founderKnowsAbout" placeholder="Expertise URLs" value={formData.founderKnowsAbout} onChange={handleInputChange} /><div className="row"><input name="founderLocality" placeholder="Founder City" value={formData.founderLocality} onChange={handleInputChange} /><input name="founderRegion" placeholder="Founder State" value={formData.founderRegion} onChange={handleInputChange} /></div></div></div>
              <div className="form-section"><h3>Hours & Offerings</h3><div className="days-selector">{DAYS.map(day => (<button key={day} className={formData.openingDays?.includes(day) ? 'day-btn active' : 'day-btn'} onClick={() => handleDayToggle(day)}>{day.slice(0, 3)}</button>))}</div><div className="row mt-1"><div><label>Open</label><input type="time" name="opens" value={formData.opens} onChange={handleInputChange} /></div><div><label>Close</label><input type="time" name="closes" value={formData.closes} onChange={handleInputChange} /></div></div><textarea name="offerCatalog" placeholder="Offerings (comma)" className="mt-1" value={formData.offerCatalog} onChange={handleInputChange} /></div>
              <div className="form-section"><h3>Multi-Location</h3><button className="add-small" onClick={addLocation}>+ Add Location</button>{formData.locations?.map((loc, i) => (<div key={i} className="location-card"><div className="card-header"><h4>Location {i+1}</h4><button className="remove-btn" onClick={() => removeLocation(i)}>×</button></div><div className="form-grid"><input placeholder="Street" value={loc.streetAddress} onChange={e => updateLocation(i, 'streetAddress', e.target.value)} /><input placeholder="Phone" value={loc.telephone} onChange={e => updateLocation(i, 'telephone', e.target.value)} /></div></div>))}</div>
              <div className="form-section"><h3>Reviews</h3><button className="add-small" onClick={addReview}>+ Add Review</button><ReviewEditor reviews={formData.reviews || []} onUpdate={updateReview} onRemove={removeReview} /></div>
            </div>
          )}
          {schemaType === 'SERVICE' && (
            <div className="form-sections">
              <div className="form-section"><h3>Service Info</h3><div className="form-grid"><input name="name" placeholder="Service Name" value={formData.name} onChange={handleInputChange} /><input name="serviceType" placeholder="Category" value={formData.serviceType} onChange={handleInputChange} /><input name="providerName" placeholder="Provider" value={formData.providerName} onChange={handleInputChange} /><textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} /></div></div>
              <div className="form-section"><h3>Audience & Catalog</h3><div className="form-grid"><input name="audience" placeholder="Target Audience" value={formData.audience} onChange={handleInputChange} /><textarea name="offerCatalog" placeholder="Offerings (comma)" value={formData.offerCatalog} onChange={handleInputChange} /></div></div>
              <div className="form-section"><h3>Reviews</h3><button className="add-small" onClick={addReview}>+ Add Review</button><ReviewEditor reviews={formData.reviews || []} onUpdate={updateReview} onRemove={removeReview} /></div>
            </div>
          )}
          {schemaType === 'PRODUCT' && (
            <div className="form-sections">
              <div className="form-section"><h3>Product Specs</h3><div className="form-grid"><input name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} /><input name="brandName" placeholder="Brand" value={formData.brandName} onChange={handleInputChange} /><div className="row"><input name="sku" placeholder="SKU" value={formData.sku} onChange={handleInputChange} /><input name="gtin" placeholder="GTIN" value={formData.gtin} onChange={handleInputChange} /></div><div className="row"><input name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} /><input name="priceCurrency" value={formData.priceCurrency} onChange={handleInputChange} /></div></div></div>
              <div className="form-section"><h3>Reviews</h3><button className="add-small" onClick={addReview}>+ Add Review</button><ReviewEditor reviews={formData.reviews || []} onUpdate={updateReview} onRemove={removeReview} /></div>
            </div>
          )}
          {schemaType === 'ARTICLE' && (
            <div className="form-sections">
              <div className="form-section"><h3>Content & Author</h3><div className="form-grid"><input name="headline" placeholder="Headline" value={formData.headline} onChange={handleInputChange} /><input name="authorName" placeholder="Author" value={formData.authorName} onChange={handleInputChange} /><input name="authorJobTitle" placeholder="Title" value={formData.authorJobTitle} onChange={handleInputChange} /><textarea name="authorSameAs" placeholder="Author Links" value={formData.authorSameAs} onChange={handleInputChange} /></div></div>
              <div className="form-section"><h3>Publisher</h3><div className="form-grid"><input name="publisherName" placeholder="Publisher" value={formData.publisherName} onChange={handleInputChange} /><input name="publisherLogo" placeholder="Logo URL" value={formData.publisherLogo} onChange={handleInputChange} /><input type="date" name="datePublished" value={formData.datePublished} onChange={handleInputChange} /></div></div>
            </div>
          )}
          {schemaType === 'PERSON' && (
            <div className="form-sections">
              <div className="form-section"><h3>Identity</h3><div className="form-grid"><input name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} /><input name="jobTitle" placeholder="Job Title" value={formData.jobTitle} onChange={handleInputChange} /><textarea name="sameAs" placeholder="SameAs Links" value={formData.sameAs} onChange={handleInputChange} /><textarea name="knowsAbout" placeholder="Expertise" value={formData.knowsAbout} onChange={handleInputChange} /></div></div>
            </div>
          )}
          {schemaType === 'CITY_PAGE' && (
            <div className="form-sections">
              <div className="form-section"><h3>Context</h3><div className="form-grid"><input name="name" placeholder="Business Name" value={formData.name} onChange={handleInputChange} /><input name="url" placeholder="Page URL" value={formData.url} onChange={handleInputChange} /><input name="areaServed" placeholder="Target City" value={formData.areaServed} onChange={handleInputChange} /></div></div>
              <div className="form-section"><h3>FAQs</h3><FAQEditor faqs={formData.faqs || []} onUpdate={updateFaq} onAdd={addFaq} onRemove={removeFaq} /></div>
            </div>
          )}
          {schemaType === 'FAQ' && (<div className="form-section"><FAQEditor faqs={formData.faqs || []} onUpdate={updateFaq} onAdd={addFaq} onRemove={removeFaq} /></div>)}
        </section>
        <section className="preview-panel"><div className="preview-header"><span>Semantic Output</span><button className="copy-btn" onClick={copyToClipboard}>{copyStatus}</button></div><pre className="code-block"><code>{generatedJsonLd}</code></pre></section>
      </main>
    </div>
  )
}

function FAQEditor({ faqs, onUpdate, onAdd, onRemove }: any) {
  return (<div className="faq-editor">{faqs.map((f: any, i: number) => (<div key={i} className="faq-item"><div className="faq-header"><h4>FAQ {i+1}</h4>{i > 0 && <button className="remove-btn" onClick={() => onRemove(i)}>×</button>}</div><input placeholder="Q" value={f.question} onChange={e => onUpdate(i, 'question', e.target.value)} /><textarea placeholder="A" value={f.answer} onChange={e => onUpdate(i, 'answer', e.target.value)} /></div>))}<button className="add-btn" onClick={onAdd}>+ Add FAQ</button></div>)
}
function ReviewEditor({ reviews, onUpdate, onRemove }: any) {
  return (<div className="faq-editor">{reviews.map((r: any, i: number) => (<div key={i} className="faq-item"><div className="faq-header"><h4>Review {i+1}</h4><button className="remove-btn" onClick={() => onRemove(i)}>×</button></div><input placeholder="Reviewer" value={r.authorName} onChange={e => onUpdate(i, 'authorName', e.target.value)} /><textarea placeholder="Body" value={r.reviewBody} onChange={e => onUpdate(i, 'reviewBody', e.target.value)} /></div>))}</div>)
}

export default App
