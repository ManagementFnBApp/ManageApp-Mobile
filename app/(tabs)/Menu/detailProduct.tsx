import DetailProductPage, { DetailProductParams } from "@/components/MenuScreen/EditProductPage";
import { useLocalSearchParams } from 'expo-router';

export default function EditProduct() {
    const params = useLocalSearchParams();

    // derive product directly from params (support both prefixed PD* keys and non-prefixed keys)
    const product: DetailProductParams | undefined = params
        ? (() => {
              const pDid = (params.PDid ?? params.id) as string | undefined;
              const pName = (params.PDname ?? params.name) as string | undefined;
              const pPriceRaw = (params.PDprice ?? params.price) as string | undefined;
              const pCategory = (params.PDcategory ?? params.category) as string | undefined;
              const pDescription = (params.PDdescription ?? params.description) as string | undefined;
              const pInStockRaw = (params.PDinStock ?? params.inStock) as string | undefined;
              const pCategoryOpenRaw = (params.PDcategoryOpen ?? params.categoryOpen) as string | undefined;

              return {
                  PDid: pDid,
                  PDname: pName,
                  PDprice: pPriceRaw ? Number(pPriceRaw) : undefined,
                  PDcategory: pCategory,
                  PDdescription: pDescription,
                  PDinStock: pInStockRaw === 'true' ? true : pInStockRaw === 'false' ? false : undefined,
                  PDcategoryOpen: pCategoryOpenRaw === 'true',
              };
          })()
        : undefined;

    //console.log('EditProduct received params:', params);

    // DetailProductPage can handle undefined/null props itself
    return <DetailProductPage {...product} />;
}