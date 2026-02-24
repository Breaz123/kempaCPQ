/**
 * Poederlak Realisaties Gallery Component
 * 
 * Interactieve gallery met lightbox functionaliteit voor poederlak realisaties
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  // Voor slides: array van images (eerste is hoofdbeeld, tweede is uitvergroting)
  slides?: GalleryImage[];
}

interface PoederlakGalleryProps {
  images?: GalleryImage[];
  imagesPath?: string;
}

export function PoederlakGallery({ images, imagesPath = '/images/poederlak' }: PoederlakGalleryProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0); // Voor slides binnen een item
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (images && images.length > 0) {
      setGalleryImages(images);
      setLoading(false);
    } else {
      // Laad images uit de public folder
      loadImagesFromFolder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const loadImagesFromFolder = async () => {
    try {
      // Probeer een lijst van images te krijgen via de API of gebruik fallback
      // Lijst van beschikbare poederlak realisatie images
      // Deze worden automatisch geladen uit de public/images/poederlak folder
      const fallbackImages: GalleryImage[] = [
        // Model images
        { id: '1', src: `${imagesPath}/Model-web_0006_Model-1-1-1.jpg`, alt: 'Poederlak model 1', title: 'Poederlak Model 1' },
        { id: '2', src: `${imagesPath}/Model-web_0005_Model-2-1.jpg`, alt: 'Poederlak model 2', title: 'Poederlak Model 2' },
        { id: '3', src: `${imagesPath}/Model-web_0004_Model-3-.jpg`, alt: 'Poederlak model 3', title: 'Poederlak Model 3' },
        { id: '4', src: `${imagesPath}/Model-web_0003_Model-4-1-2.jpg`, alt: 'Poederlak model 4', title: 'Poederlak Model 4' },
        { id: '5', src: `${imagesPath}/Model-web_0002_Model-5-1-2.jpg`, alt: 'Poederlak model 5', title: 'Poederlak Model 5' },
        { id: '6', src: `${imagesPath}/Model-web_0001_Model-6-1-2.jpg`, alt: 'Poederlak model 6', title: 'Poederlak Model 6' },
        { id: '7', src: `${imagesPath}/Model-web_0000_Model-7-1-2.jpg`, alt: 'Poederlak model 7', title: 'Poederlak Model 7' },
        // Kempa realisaties - paren met slides (eerste is hoofdbeeld, tweede is uitvergroting)
        { 
          id: '8', 
          src: `${imagesPath}/Kempa_30052024-120-3-scaled.jpg`, 
          alt: 'Kempa poederlak realisatie', 
          title: 'Poederlak Realisatie',
          slides: [
            { id: '8', src: `${imagesPath}/Kempa_30052024-120-3-scaled.jpg`, alt: 'Kempa poederlak realisatie', title: 'Poederlak Realisatie' },
            { id: '9', src: `${imagesPath}/Kempa_30052024-121-1-scaled.jpg`, alt: 'Kempa poederlak realisatie (uitvergroting)', title: 'Poederlak Realisatie - Detail' }
          ]
        },
        { 
          id: '10', 
          src: `${imagesPath}/Kempa_30052024-122-2-scaled.jpg`, 
          alt: 'Kempa poederlak realisatie', 
          title: 'Poederlak Realisatie',
          slides: [
            { id: '10', src: `${imagesPath}/Kempa_30052024-122-2-scaled.jpg`, alt: 'Kempa poederlak realisatie', title: 'Poederlak Realisatie' },
            { id: '11', src: `${imagesPath}/Kempa_30052024-123-1-scaled.jpg`, alt: 'Kempa poederlak realisatie (uitvergroting)', title: 'Poederlak Realisatie - Detail' }
          ]
        },
        { 
          id: '12', 
          src: `${imagesPath}/Kempa_30052024-124-3-scaled.jpg`, 
          alt: 'Kempa poederlak realisatie', 
          title: 'Poederlak Realisatie',
          slides: [
            { id: '12', src: `${imagesPath}/Kempa_30052024-124-3-scaled.jpg`, alt: 'Kempa poederlak realisatie', title: 'Poederlak Realisatie' },
            { id: '13', src: `${imagesPath}/Kempa_30052024-125-1-scaled.jpg`, alt: 'Kempa poederlak realisatie (uitvergroting)', title: 'Poederlak Realisatie - Detail' }
          ]
        },
        // Realisatie 14 verwijderd
        { id: '15', src: `${imagesPath}/Kempa_30052024-150-1-1365x2048.jpg`, alt: 'Kempa poederlak realisatie', title: 'Poederlak Realisatie' },
        { id: '16', src: `${imagesPath}/Kempa_30052024-152-1-1365x2048.jpg`, alt: 'Kempa poederlak realisatie', title: 'Poederlak Realisatie' },
        // Poederlak images (using high resolution versions)
        { id: '17', src: `${imagesPath}/Poederlak-5-1365x2048.jpg`, alt: 'Poederlak realisatie', title: 'Poederlak Realisatie' },
        { id: '18', src: `${imagesPath}/Poederlak-6-1366x2048.jpg`, alt: 'Poederlak realisatie', title: 'Poederlak Realisatie' },
        { id: '19', src: `${imagesPath}/Poederlak--1366x2048.jpg`, alt: 'Poederlak realisatie', title: 'Poederlak Realisatie' },
        // Note: Realisaties 20-33 zijn verwijderd uit de gallery maar blijven beschikbaar voor gebruik elders op de website
        { id: '34', src: `${imagesPath}/Achtergrond-Vakmanplatform-kempa.jpg`, alt: 'Kempa vakmanplatform', title: 'Kempa Vakmanplatform' },
      ];

      // Filter alleen images die bestaan (we kunnen dit niet echt checken zonder API)
      setGalleryImages(fallbackImages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading images:', error);
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setSelectedSlideIndex(0); // Reset naar eerste slide
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    setSelectedSlideIndex(0);
    document.body.style.overflow = 'unset';
  };

  const getCurrentImages = (): GalleryImage[] => {
    if (selectedImageIndex === null) return [];
    const currentItem = galleryImages[selectedImageIndex];
    // Als dit item slides heeft, gebruik die; anders gebruik het item zelf
    return currentItem.slides || [currentItem];
  };

  const goToPrevious = () => {
    if (selectedImageIndex === null) return;
    const currentImages = getCurrentImages();
    
    // Als er meerdere slides zijn binnen dit item, navigeer eerst binnen de slides
    if (currentImages.length > 1 && selectedSlideIndex > 0) {
      setSelectedSlideIndex(selectedSlideIndex - 1);
    } else {
      // Ga naar vorige item
      setSelectedImageIndex(
        selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1
      );
      setSelectedSlideIndex(0);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex === null) return;
    const currentImages = getCurrentImages();
    
    // Als er meerdere slides zijn binnen dit item, navigeer eerst binnen de slides
    if (currentImages.length > 1 && selectedSlideIndex < currentImages.length - 1) {
      setSelectedSlideIndex(selectedSlideIndex + 1);
    } else {
      // Ga naar volgende item
      setSelectedImageIndex(
        selectedImageIndex === galleryImages.length - 1 ? 0 : selectedImageIndex + 1
      );
      setSelectedSlideIndex(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        const currentItem = galleryImages[selectedImageIndex];
        const currentImages = currentItem?.slides || [currentItem];
        
        if (currentImages.length > 1 && selectedSlideIndex > 0) {
          setSelectedSlideIndex(selectedSlideIndex - 1);
        } else {
          setSelectedImageIndex(
            selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1
          );
          setSelectedSlideIndex(0);
        }
      } else if (e.key === 'ArrowRight') {
        const currentItem = galleryImages[selectedImageIndex];
        const currentImages = currentItem?.slides || [currentItem];
        
        if (currentImages.length > 1 && selectedSlideIndex < currentImages.length - 1) {
          setSelectedSlideIndex(selectedSlideIndex + 1);
        } else {
          setSelectedImageIndex(
            selectedImageIndex === galleryImages.length - 1 ? 0 : selectedImageIndex + 1
          );
          setSelectedSlideIndex(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, selectedSlideIndex, galleryImages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (galleryImages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Geen afbeeldingen gevonden.</p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryImages.map((image, index) => {
          const hasSlides = image.slides && image.slides.length > 1;
          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="aspect-square overflow-hidden rounded-lg bg-gray-100 group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 relative"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {hasSlides && (
                <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
                  {(image.slides?.length ?? 0)} foto's
                </div>
              )}
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-medium">{image.title}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous Button */}
            {(galleryImages.length > 1 || (selectedImageIndex !== null && getCurrentImages().length > 1)) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                aria-label="Vorige afbeelding"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Next Button */}
            {(galleryImages.length > 1 || (selectedImageIndex !== null && getCurrentImages().length > 1)) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                aria-label="Volgende afbeelding"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
            
            {/* Slide indicators voor items met meerdere slides */}
            {selectedImageIndex !== null && getCurrentImages().length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {getCurrentImages().map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlideIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === selectedSlideIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Ga naar foto ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image with slides support */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSlideIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const currentImages = getCurrentImages();
                  const currentImage = currentImages[selectedSlideIndex];
                  
                  return (
                    <>
                      <img
                        src={currentImage.src}
                        alt={currentImage.alt}
                        className="max-w-full max-h-full object-contain"
                      />
                      
                      {/* Image Info */}
                      {(currentImage.title || currentImage.alt) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-center">
                          {currentImage.title && (
                            <h3 className="text-white text-xl font-semibold mb-2">
                              {currentImage.title}
                            </h3>
                          )}
                          <p className="text-white/80 text-sm">
                            {currentImage.alt}
                          </p>
                          <div className="flex items-center justify-center gap-4 mt-2">
                            {currentImages.length > 1 && (
                              <p className="text-white/60 text-xs">
                                Foto {selectedSlideIndex + 1} / {currentImages.length}
                              </p>
                            )}
                            {galleryImages.length > 1 && (
                              <p className="text-white/60 text-xs">
                                • Realisatie {selectedImageIndex + 1} / {galleryImages.length}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
