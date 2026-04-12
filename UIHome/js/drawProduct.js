import {fetchAPI} from "./export.js";
import {sanpham} from "./api.js";

const products = document.querySelector("#products");
export const drawProduct = () =>{
    fetchAPI(sanpham)
        .then(data =>{
            let htmls = data.map(item =>{
                return `
                <div class="col-4">
                    <div class="inner-box">
                        <div class="inner-img">
                            <img src="${item.ImageURL}" alt="#">
                        </div>
                        <div class="inner-content">
                            <div class="inner-name">Tên: ${item.ProductName} </div>
                            <div class="inner-desc">${item.Description}</div>
                            <div class="inner-gia">Giá: ${item.Price} </div>
                            <div class="inner-status">Trạng thái: ${item.Status}</div>
                        </div>
                    </div>
                </div>
                `
            });
            console.log(htmls.join(""));
            products.innerHTML= htmls.join("");
        })
}