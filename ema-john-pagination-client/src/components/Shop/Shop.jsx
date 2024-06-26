import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0)
    const {count} = useLoaderData();

    const numberOfPages = Math.ceil(count/itemsPerPage);

  console.log("current Page" , currentPage);

    //to get all pages by number
        // const pages = [];
        // for(let i=0; i < numberOfPages; i++){
        //   pages.push(i);
        // }
    const pages = [...Array(numberOfPages).keys()]


    /**
     * Steps
     * ===============
     * 1. get the total number of products
     * 2. number of items per page dynamic
     * 3. total number of pages & put them in a array
     * 4. keep current page on the state
     */

    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&size=${itemsPerPage}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        const storedCart = getShoppingCart();
        const savedCart = [];
        // step 1: get id of the addedProduct
        for (const id in storedCart) {
            // step 2: get product from products state by using id
            const addedProduct = products.find(product => product._id === id)
            if (addedProduct) {
                // step 3: add quantity
                const quantity = storedCart[id];
                addedProduct.quantity = quantity;
                // step 4: add the added product to the saved cart
                savedCart.push(addedProduct);
            }
            // console.log('added Product', addedProduct)
        }
        // step 5: set the cart
        setCart(savedCart);
    }, [products])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    const handleItemsPerPage = (e) => {
      const value = parseInt(e.target.value);
      console.log(value);
      setItemsPerPage(value);
      setCurrentPage(0);
    }

    const handlePrevBtn = () => {      
      if(currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
    const handleNextBtn = () => {      
     if(currentPage < pages.length -1 ) {
      setCurrentPage(currentPage + 1)
    }
    }

    return (
        <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={cart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>

            <div className='pagination'>
           
              {currentPage > 0 &&  <button onClick={handlePrevBtn}>Prev</button>}

                {
                  pages.map(page => <button 
                    className={currentPage === page ? 'selected' : ''}
                    onClick={() => setCurrentPage(page)}
                    key={page}>{page}</button>)
                }
              {
                currentPage < pages.length - 1 && <button onClick={handleNextBtn}>Next</button>
              }



                <select onChange={handleItemsPerPage} value={itemsPerPage} name='' id=''>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
            </div>
        </div>
    );
};

export default Shop;