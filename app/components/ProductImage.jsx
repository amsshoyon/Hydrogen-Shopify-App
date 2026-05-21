import {Image} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';

export function ProductGallery({images, selectedImage}) {
  const allImages = images?.nodes || [];
  const uniqueImages = allImages.length > 0
    ? dedupeImages(allImages)
    : [];

  const [activeImage, setActiveImage] = useState(
    selectedImage || uniqueImages[0] || null,
  );

  useEffect(() => {
    if (selectedImage) {
      setActiveImage(selectedImage);
    }
  }, [selectedImage]);

  if (!activeImage && !uniqueImages.length) {
    return (
      <div className="aspect-square rounded-2xl bg-surface" />
    );
  }

  const galleryImages = uniqueImages.length > 0 ? uniqueImages : activeImage ? [activeImage] : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square rounded-2xl overflow-hidden bg-surface">
        {activeImage ? (
          <Image
            alt={activeImage.altText || 'Product Image'}
            aspectRatio="1/1"
            data={activeImage}
            key={activeImage.id}
            sizes="(min-width: 45em) 50vw, 100vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}
      </div>
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((image) => {
            const isActive = image.id === activeImage?.id;
            return (
              <button
                key={image.id}
                onClick={() => setActiveImage(image)}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-transparent hover:border-border opacity-70 hover:opacity-100'
                }`}
                aria-label={image.altText || 'View variant'}
              >
                <Image
                  alt={image.altText || ''}
                  data={image}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function dedupeImages(images) {
  const seen = new Set();
  return images.filter((img) => {
    if (seen.has(img.id)) return false;
    seen.add(img.id);
    return true;
  });
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
