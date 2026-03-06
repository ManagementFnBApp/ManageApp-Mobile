export type MenuItem = {
    PDid: string;
    PDname: string;
    PDprice: number;
    PDinStock: boolean;
    PDcategory: string;
    PDdescription?: string;
    PDimage?: string;
    PDcategoryOpen?: boolean;
}

const CATEGORIES = ['All', 'Coffee', 'Juice', 'Soft Drink', 'Tea', 'Snack'];

const MENU_ITEMS: MenuItem[] = [
    { PDid: '1', PDdescription: 'A strong and bold coffee', PDname: 'Espresso', PDprice: 25, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80' },
    { PDid: '2', PDdescription: 'A creamy and smooth coffee with milk', PDname: 'Milk Coffee', PDprice: 29, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
    { PDid: '3', PDdescription: 'A simple black coffee without milk or sugar', PDname: 'Black Coffee', PDprice: 20, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
    { PDid: '4', PDdescription: 'A creamy coffee with steamed milk and foam on top', PDname: 'Latte', PDprice: 35, PDinStock: false, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80' },
    { PDid: '5', PDdescription: 'A coffee with steamed milk and a layer of foam on top of it', PDname: 'Cappuccino', PDprice: 35, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80' },
    { PDid: '6', PDdescription: 'A chocolate-flavored coffee drink made with espresso and steamed milk and topped with whipped cream.', PDname: 'Mocha', PDprice: 39, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80' },
    { PDid: '7', PDdescription: 'Freshly squeezed orange juice', PDname: 'Orange Juice', PDprice: 25, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
    { PDid: '8', PDdescription: 'A refreshing carbonated soft drink', PDname: 'Coca Cola', PDprice: 15, PDinStock: true, PDcategory: 'Soft Drink', PDimage: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
    { PDid: '9', PDdescription: 'A hot beverage made from steeping tea leaves in boiling water', PDname: 'Green Tea', PDprice: 20, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
    { PDid: '10', PDdescription: 'A light and crispy snack, perfect for sharing', PDname: 'French Fries', PDprice: 30, PDinStock: false, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
    { PDid: '11', PDdescription: 'A sweet and fluffy pastry filled with cream', PDname: 'Cream Puff', PDprice: 22, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
    { PDid: '12', PDdescription: 'A rich espresso topped with hot water for a smooth taste', PDname: 'Americano', PDprice: 28, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1527169402691-a19f59e4b6f8?w=400&q=80' },
    { PDid: '13', PDdescription: 'A strong Vietnamese coffee brewed with condensed milk', PDname: 'Vietnamese Iced Coffee', PDprice: 32, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1558126319-c9feecbf57ee?w=400&q=80' },
    { PDid: '14', PDdescription: 'A refreshing iced tea with lemon flavor', PDname: 'Lemon Iced Tea', PDprice: 22, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
    { PDid: '15', PDdescription: 'A creamy blended coffee served cold with ice', PDname: 'Frappuccino', PDprice: 42, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
    { PDid: '16', PDdescription: 'Fresh watermelon juice served chilled', PDname: 'Watermelon Juice', PDprice: 27, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1571687949920-ecf1b39bce74?w=400&q=80' },
    { PDid: '17', PDdescription: 'Sweet mango smoothie blended with fresh milk', PDname: 'Mango Smoothie', PDprice: 33, PDinStock: false, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1589308078054-8327b9a4d37e?w=400&q=80' },
    { PDid: '18', PDdescription: 'Classic black tea with a strong aroma', PDname: 'Black Tea', PDprice: 18, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80' },
    { PDid: '19', PDdescription: 'Sparkling lemon soda with ice', PDname: 'Sprite', PDprice: 15, PDinStock: true, PDcategory: 'Soft Drink', PDimage: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80' },
    { PDid: '20', PDdescription: 'A delicious chocolate chip cookie', PDname: 'Chocolate Cookie', PDprice: 18, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80' },
    { PDid: '21', PDdescription: 'A crispy grilled sandwich with ham and cheese', PDname: 'Grilled Sandwich', PDprice: 40, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
    { PDid: '22', PDdescription: 'Hot chocolate topped with whipped cream', PDname: 'Hot Chocolate', PDprice: 30, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80' },
    { PDid: '23', PDdescription: 'A refreshing strawberry milkshake', PDname: 'Strawberry Milkshake', PDprice: 35, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80' },
    { PDid: '24', PDdescription: 'Traditional Vietnamese iced tea', PDname: 'Peach Tea', PDprice: 26, PDinStock: true, PDcategory: 'Tea', PDimage: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80' },
    { PDid: '25', PDdescription: 'A fizzy orange flavored soft drink', PDname: 'Fanta', PDprice: 15, PDinStock: true, PDcategory: 'Soft Drink', PDimage: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80' },
    { PDid: '26', PDdescription: 'Fresh pineapple juice with natural sweetness', PDname: 'Pineapple Juice', PDprice: 28, PDinStock: false, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1571687949920-ecf1b39bce74?w=400&q=80' },
    { PDid: '27', PDdescription: 'A creamy avocado smoothie blended with condensed milk', PDname: 'Avocado Smoothie', PDprice: 36, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1584270354949-1a9f3e7a4d58?w=400&q=80' },
    { PDid: '28', PDdescription: 'Classic butter croissant, flaky and soft', PDname: 'Croissant', PDprice: 24, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
    { PDid: '29', PDdescription: 'A cold brew coffee steeped for 12 hours', PDname: 'Cold Brew', PDprice: 38, PDinStock: true, PDcategory: 'Coffee', PDimage: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80' },
    { PDid: '30', PDdescription: 'A refreshing mint lemonade with crushed ice', PDname: 'Mint Lemonade', PDprice: 29, PDinStock: true, PDcategory: 'Juice', PDimage: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80' },
    { PDid: '31', PDdescription: 'Classic salted potato chips', PDname: 'Potato Chips', PDprice: 20, PDinStock: true, PDcategory: 'Snack', PDimage: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
];

export const getAllProducts = async () => {
    return MENU_ITEMS;
}

export const getAllCategories = async () => {
    return CATEGORIES;
}