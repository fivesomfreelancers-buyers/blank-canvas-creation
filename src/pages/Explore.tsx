import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeProvider';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Explore = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const gigsPerPage = 12;
  const [allGigs, setAllGigs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isTopRated, setIsTopRated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Categories are hardcoded since there's no categories table
        setCategories([
          { id: 'all', name: 'All Categories' },
          { id: 'design', name: 'Design & Graphics' },
          { id: 'development', name: 'Web Development' },
          { id: 'writing', name: 'Writing & Translation' },
          { id: 'marketing', name: 'Digital Marketing' },
          { id: 'video', name: 'Video & Animation' },
          { id: 'music', name: 'Music & Audio' },
        ]);

        const { data: gigsData } = await supabase
          .from('gigs')
          .select(`*, freelancers ( user_id, rating )`)
          .eq('status', 'active');

        const formattedGigs = await Promise.all((gigsData || []).map(async (gig) => {
          const { data: profile } = await supabase
            .from('public_profiles' as any)
            .select('full_name, profile_image_url')
            .eq('id', gig.freelancers?.user_id)
            .maybeSingle();

          const { data: reviews } = await supabase
            .from('gig_reviews')
            .select('rating')
            .eq('gig_id', gig.id);

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            id: gig.id,
            title: gig.title,
            freelancer: profile?.full_name || 'Anonymous',
            freelancerId: gig.freelancer_id,
            freelancerAvatar: profile?.profile_image_url || '',
            rating: avgRating,
            reviews: reviews?.length || 0,
            price: Number(gig.base_price),
            image: gig.thumbnail_url || gig.images?.[0] || '',
            category: gig.category_id
          };
        }));

        setAllGigs(formattedGigs);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGigs = selectedCategory === 'all' 
    ? allGigs 
    : allGigs.filter(gig => gig.category === selectedCategory);

  const searchFilteredGigs = searchQuery 
    ? filteredGigs.filter(gig => 
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.freelancer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredGigs;

  const finalFilteredGigs = searchFilteredGigs.filter(gig => {
    if (gig.price < priceRange[0] || gig.price > priceRange[1]) return false;
    if (selectedRating > 0 && gig.rating < selectedRating) return false;
    if (isTopRated && gig.rating < 4.8) return false;
    return true;
  });

  const totalPages = Math.ceil(finalFilteredGigs.length / gigsPerPage);
  const startIndex = (currentPage - 1) * gigsPerPage;
  const currentGigs = finalFilteredGigs.slice(startIndex, startIndex + gigsPerPage);

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
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Services</h1>
            <p className="text-lg text-muted-foreground">Discover talented freelancers ready to help grow your business</p>
            <p className="text-sm mt-2 text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${currentGigs.length} of ${finalFilteredGigs.length} gigs`}
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
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="px-4 py-3 rounded-xl border-0 outline-none bg-muted/50 text-foreground"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

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
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading gigs...</div>
          ) : currentGigs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No gigs found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentGigs.map(gig => (
                <Link
                  key={gig.id}
                  to={`/gig/${gig.id}`}
                  className="group backdrop-blur-lg rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl bg-card border border-border"
                >
                  <div className="relative overflow-hidden">
                    {gig.image ? (
                      <img
                        src={gig.image}
                        alt={gig.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-sm text-foreground group-hover:text-primary transition-colors">
                      {gig.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={gig.freelancerAvatar} alt={gig.freelancer} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {gig.freelancer.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">by {gig.freelancer}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-foreground">
                          {gig.rating > 0 ? gig.rating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-xs text-muted-foreground">({gig.reviews})</span>
                      </div>
                      <div className="text-sm font-bold text-primary">${gig.price}</div>
                    </div>
                  </div>
                </Link>
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
