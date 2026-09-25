import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '../components/Navbar';
import SEO, { SITE_URL } from '../components/SEO';
import { useTheme } from '../components/ThemeProvider';
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
        description="Browse gigs from African and Somali freelancers on FIVESOM. Compare design, development, writing and video services, then order with escrow-protected payment."
        canonical="/explore"
        noindex={Array.from(searchParams.keys()).length > 0}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${SITE_URL}/explore#collectionpage`,
          name: 'Explore Freelance Services & Gigs',
          description: 'Browse gigs from African and Somali freelancers on FIVESOM.',
          url: `${SITE_URL}/explore`,
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
        }}

      />
      <Navbar />
      
      <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-3xl">
            <span className="mb-3 block text-sm font-semibold text-primary">Fivesom marketplace</span>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-5xl">Find the right service for your next project</h1>
            <p className="text-base text-muted-foreground sm:text-lg">Compare real work, seller ratings, delivery options, and clear starting prices.</p>
            <p className="mt-3 text-sm font-medium text-foreground">
              {loading ? 'Loading...' : `Showing ${currentGigs.length} of ${total} gigs`}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="search"
                  aria-label="Search services"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search for services..."
                  className="h-12 w-full rounded-md border border-input bg-background pl-12 pr-4 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('all'); setCurrentPage(1); }}
                className="h-12 rounded-md border border-input bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-ring"
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
                  className="h-12 rounded-md border border-input bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All {activeCategory.name}</option>
                  {activeCategory.subcategories.map(sub => (
                    <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              )}

              <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-12 px-5">
                    <SlidersHorizontal size={18} />
                    <span>More Filters</span>
                  </Button>
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
            <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
