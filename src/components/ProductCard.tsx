import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/types";

type LegacyProps = {
  title?: string;
  image?: string;
  features?: string[];
  badge?: string;
  link?: string;
};

interface ProductCardProps extends LegacyProps {
  product?: Product;
  onQuickView?: () => void;
}

const ProductCard = ({ product, onQuickView, title, image, link }: ProductCardProps) => {
  const data: Product | undefined = product || (title
    ? {
        id: "legacy",
        title: title,
        slug: (link || "/produtos").split("/").pop() || "produto",
        description: "",
        short_description: "",
        sku: null,
        price: null,
        stock_qty: 0,
        status: "ACTIVE",
        category_id: "",
        images: image ? [image] : [],
        technical_specs: {},
        dimensions: {},
        seo_title: null,
        seo_description: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : undefined);
  return (
    <Card className="card-glow group overflow-hidden rounded-2xl border-line bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        {data?.images?.[0] && (
          <img
            src={data.images[0]}
            alt={data.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {data?.status === 'ACTIVE' && (
          <Badge className="absolute right-4 top-4 bg-brand text-white">Disponível</Badge>
        )}
        {onQuickView && (
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-4 right-4 bg-white/90"
            onClick={onQuickView}
          >
            <Eye className="mr-2 h-4 w-4" />
            Quick View
          </Button>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="mb-2 font-heading text-xl font-bold text-foreground">{data?.title || title}</h3>
        {data && (
          <div className="mb-4 text-sm text-muted-foreground">
            SKU: {data.sku || '—'}
          </div>
        )}
        <Link to={data ? `/produtos/${data.slug}` : link || "/produtos"}>
          <Button variant="outline" className="w-full">Ver Detalhes</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
