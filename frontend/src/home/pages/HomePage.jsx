import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../api/client.js';

const categoryImages = ['/img/nhan.png', '/img/vong_co.png', '/img/vongtay.jpg', '/img/bongtai.jpg', '/img/vongchan.png', '/img/trangsuccuoi.png', '/img/charm.png'];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = featuredProducts[activeIndex];

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest('/public/categories', { authenticated: false }),
      apiRequest('/public/products', { authenticated: false }),
    ]).then(([categoryData, productData]) => {
      if (!active) return;
      setCategories(Array.isArray(categoryData) ? categoryData : categoryData.content || []);
      setFeaturedProducts((Array.isArray(productData) ? productData : productData.content || []).slice(0, 6));
    }).catch((error) => console.error('Không tải được nội dung trang chủ:', error));
    return () => { active = false; };
  }, []);
  return (
    <>

    <Header />

    <div className="section-one"> </div>
    <div className="section-two">
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="inner-title">
                        <h2>THƯƠNG HIỆU NỔI BẬT</h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-12 col-sm-6 col-lg-4 mb-5">
                    <div className="inner-item">
                        <img className="bn" src="./img/bn1.jpg" alt="#" />
                        <img className="bnlg" src="./img/bnlg1.png" alt="#" />
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 mb-5">
                    <div className="inner-item">
                        <img className="bn" src="./img/bn2.jpg" alt="#" />
                        <img className="bnlg" src="./img/bnlg2.svg" alt="#" />
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 mb-5">
                    <div className="inner-item">
                        <img className="bn" src="./img/bn3.jpg" alt="#" />
                        <img className="bnlg" src="./img/bn3lg.svg" alt="#" />
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 mb-5">
                    <div className="inner-item">
                        <img className="bn" src="./img/bn4.png" alt="#" />
                        <img className="bnlg" src="./img/bnlg4.png" alt="#" />
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 mb-5">
                    <div className="inner-item">
                        <img className="bn" src="./img/bn5.jpg" alt="#" />
                        <img className="bnlg" src="./img/bnlg5.svg" alt="#" />
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 mb-5">
                    <div className="inner-item">
                        <img className="bn" src="./img/bn6.jpg" alt="#" />
                        <img className="bnlg" src="./img/bnlg6.svg" alt="#" />
                    </div>
                </div>
            </div>

        </div>
    </div>

    <section className="section-four">
      <div className="container">
        <div className="row"><div className="col-12"><div className="inner-title"><h2>Dòng hàng nổi bật</h2></div></div></div>
        <div className="row">
          <div className="col-xl-5 col-lg-12"><div className="img-box"><img src={activeProduct?.imageUrl || '/img/ts1.jpg'} alt={activeProduct?.productName || 'Trang sức nổi bật'} /></div></div>
          <div className="col-xl-7 col-lg-12">
            <div className="inner-button"><div className="row">
              {featuredProducts.map((product, index) => <div className="col-6 col-md-4 mb-3" key={product.id || index}><button type="button" className={index === activeIndex ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveIndex(index)}>{product.productName}</button></div>)}
            </div></div>
            <div className="inner-content"><p>{activeProduct?.description || 'Khám phá các thiết kế trang sức nổi bật của SHYNE.'}</p></div>
          </div>
        </div>
      </div>
    </section>

    <div className="section-three">
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="inner-title">
                        <h2>Danh mục</h2>
                    </div>
                </div>
            </div>
            <div className="row" id="categoryList">
              {categories.map((category, index) => (
                <div className="col-6 col-md-4 mb-4" key={category.id || index}>
                  <a href={`/sanpham.html?categoryId=${category.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="inner-box" data-category-id={category.id}>
                      <img src={categoryImages[index % categoryImages.length]} alt={category.categoryName} />
                      <div className="inner-name">{category.categoryName}</div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
        </div>
    </div>
    <Footer />


    
    
    
    
    

</>
  );
}
