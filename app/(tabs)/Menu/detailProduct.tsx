import DetailProductPage, { DetailProductParams } from "@/components/MenuScreen/EditProductPage";
import { useLocalSearchParams } from 'expo-router';

type ProductRouteParams = {
  PDid?: string;
  PDname?: string;
  PDbarcode?: string;
  PDprice?: string;

  PDimportPrice?: string;
  PDlistPrice?: string;
  PDcategory?: string;
  PDcategoryId?: string;
  PDdescription?: string;

  PDinStock?: string;
  PDisActive?: string;
  PDimage?: string;
  PDmeasureUnit?: string;
  PDcategoryOpen?: string;
};

// export type DetailProductParams = {
//     // Core (required)
//     PDid?: string;
//     PDname?: string;
//     PDbarcode?: string;
//     PDprice?: number;
    
//     // ✅ New from handlePress
//     PDimportPrice?: number;
//     PDcategory?: string;
//     PDcategoryId?: string;
//     PDdescription?: string;

//     PDinStock?: boolean;
//     PDimage?: string;
//     PDmeasureUnit?: string;
//     PDisActive?: boolean;
// };

export default function EditProduct() {
    const params = useLocalSearchParams<ProductRouteParams>();

    // ✅ Complete param parsing with ALL fields
    const product: DetailProductParams = {
        // Core fields (required)
        PDid: (params.PDid) as string | undefined,
        PDname: (params.PDname ?? params.PDname) as string | undefined,
        PDbarcode: (params.PDbarcode ?? params.PDbarcode) as string | undefined,

        PDimportPrice: params.PDimportPrice ? Number(params.PDimportPrice) : undefined,
        PDlistPrice: params.PDlistPrice ? Number(params.PDlistPrice) : undefined,
        
        // ✅ New fields from handlePress
        PDcategory: (params.PDcategory ?? params.PDcategory) as string | undefined,
        PDcategoryId: (params.PDcategoryId ?? params.PDcategoryId) as string | undefined,
        PDdescription: (params.PDdescription ?? params.PDdescription) as string | undefined,
        PDisActive: Boolean(params.PDisActive) || true,
        PDimage: (params.PDimage) as string | undefined,
        PDmeasureUnit: (params.PDmeasureUnit) as string | undefined,
    };

    // Debug log (remove in production)
    console.log('📋 EditProduct params:', {
        hasProductId: !!product.PDid,
        productName: product.PDname,
        hasBarcode: !!product.PDbarcode,
        category: product.PDcategory,
    });

    return <DetailProductPage {...product} />;
}