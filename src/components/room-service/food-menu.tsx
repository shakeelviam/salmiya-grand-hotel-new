'use client'

export function FoodMenu({ roomId }) {
 const [cart, setCart] = useState([])
 const [menu, setMenu] = useState([])

 useEffect(() => {
   loadMenu()
 }, [])

 async function loadMenu() {
   const res = await fetch('/api/room-service/menu')
   const data = await res.json()
   setMenu(data)
 }

 async function placeOrder() {
   await fetch(`/api/room-service/${roomId}/order`, {
     method: 'POST',
     body: JSON.stringify({
       type: 'FOOD',
       items: cart
     })
   })
 }

 return (
   <div>
     {/* Menu items grid */}
     {/* Cart summary */}
     <Button onClick={placeOrder}>Place Order</Button>
   </div>
 )
}