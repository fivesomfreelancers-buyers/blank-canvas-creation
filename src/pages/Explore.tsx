import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '../components/Navbar';
import SEO, { SITE_URL } from '../components/SEO';
import { useTheme } from '../components/ThemeProvider';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import GigCard from '@/components/gig/GigCard';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { useSearchParams } from 'react-router-dom';
import { useGigSearch } from '@/hooks/useGigSearch';

const Explore = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategory') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const gigsPerPage = 18;

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isTopRated, setIsTopRated] = useState(false);

  const categories = [{ slug: 'all', name: 'All Categories' }, ...CATEGORIES.map(c => ({ slug: c.slug, name: c.name }))];
  const activeCategory = getCategoryBySlug(selectedCategory);

  const { gigs: currentGigs, total, loading } = useGigSearch({
    query: searchQuery,
    category: selectedCategory,
    subcategory: selectedSubcategory,
    minPrice: priceRange[0] > 0 ? priceRange[0] : null,
    maxPrice: priceRange[1] < 500 ? priceRange[1] : null,
    minRating: isTopRated ? 4.8 : selectedRating > 0 ? selectedRating : null,
    page: currentPage,
    pageSize: gigsPerPage,
  });

  // Keep the URL in sync with the active search + filters (shareable links)
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedSubcategory !== 'all') params.subcategory = selectedSubcategory;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedSubcategory, setSearchParams]);

  const totalPages = Math.ceil(total / gigsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedRating(0);
    setIsTopRated(false);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setIsFiltersOpen(false);
  };


  return (
    <div className="min-h-screen transition-colors duration-300 bg-background">
      <SEO
        title="Explore Freelance Services & Gigs | FIVESOM"
        description="Browse thousands of gigs from verified Somali freelancers. Find design, development, writing, video, marketing services and more on FIVESOM."
        canonical="/explore"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${SITE_URL}/explore#collectionpage`,
          name: 'Explore Freelance Services & Gigs',
          description: 'Browse gigs from verified Somali freelancers on FIVESOM.',
          url: `${SITE_URL}/explore`,
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
        }}

      />
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Services</h1>
            <p className="text-lg text-muted-foreground">Discover talented freelancers ready to help grow your business</p>
            <p className="text-sm mt-2 text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${currentGigs.length} of ${total} gigs`}
            </p>
          </div>

          {/* Search and Filters */}
          <div className={`backdrop-blur-lg rounded-2xl p-6 mb-8 ${
            isDarkMode ? 'bg-card/50 border border-border' : 'bg-card/50 border border-border'
          } shadow-xl`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search for services..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-0 outline-none bg-muted/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('all'); setCurrentPage(1); }}
                className="px-4 py-3 rounded-xl border-0 outline-none bg-muted/50 text-foreground"
              >
                {categories.map(category => (
                  <option key={category.slug} value={category.slug}>{category.name}</option>
                ))}
              </select>

              {activeCategory && (
                <select
                  aria-label="Filter by subcategory"
                  value={selectedSubcategory}
                  onChange={(e) => { setSelectedSubcategory(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-3 rounded-xl border-0 outline-none bg-muted/50 text-foreground"
                >
                  <option value="all">All {activeCategory.name}</option>
                  {activeCategory.subcategories.map(sub => (
                    <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              )}

              <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DialogTrigger asChild>
                  <button className="px-6 py-3 rounded-xl flex items-center space-x-2 bg-muted/50 text-foreground hover:bg-muted transition-colors">
                    <Filter size={20} />
                    <span>More Filters</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold mb-4">Filter Services</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-foreground">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                      </label>
                      <Slider value={priceRange} onValueChange={setPriceRange} max={500} min={0} step={5} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3 text-foreground">Minimum Rating</label>
                      <div className="flex space-x-2">
                        {[0, 3, 4, 4.5, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setSelectedRating(rating)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              selectedRating === rating ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'
                            }`}
                          >
                            {rating === 0 ? 'Any' : `${rating}+`} ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="topRated" checked={isTopRated} onCheckedChange={(checked) => setIsTopRated(checked === true)} />
                      <label htmlFor="topRated" className="text-sm font-medium text-foreground">
                        Show only top-rated freelancers (4.8+ stars)
                      </label>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">Clear Filters</Button>
                      <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Results Grid */}
          <h2 className="sr-only">Search results</h2>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading gigs...</div>
          ) : currentGigs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No gigs found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-8">
              {currentGigs.map(gig => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>

          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page} className="cursor-pointer">
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Explore;
