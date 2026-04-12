
// menu
        const navItem = document.querySelectorAll(".nav-item");
        const section = document.querySelectorAll(".section");

        navItem.forEach(item => {
            item.addEventListener('click', ()=>{
                const targetId = item.getAttribute('data-target');
                navItem.forEach( nav => nav.classList.remove('active'));
                section.forEach( sec => sec.classList.remove('active'));
                item.classList.add('active');
                document.getElementById(targetId).classList.add('active');
            });
        });

        // thêm sản phẩm
        const modal = document.getElementById('modalAddProduct');
        const btnAdd = document.querySelector('.btn-add-product'); // nút trên trang chính
        const btnClose = document.getElementById('closeModal');
        const btnCancel = document.getElementById('btnCancel');

        btnAdd.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
        const closeModal = () => {
            modal.style.display = 'none';
        };
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        window.addEventListener('click', (e) => {
            if (e.target == modal) {
                closeModal();
            }
        });



// edit vặt liệu

        const editVlieu= document.getElementById('editMaterialModal');

        document.querySelector(".material-table").addEventListener('click', (e)=>{
            if(e.target.classList.contains('fa-pen') || e.target.closest('.btn-edit-m')){
                const row= e.target.closest('tr');

                const namevl= row.cells[1].innerText.trim();
                const nameng = row.cells[3].innerText.trim();
                const sl= row.cells[2].innerText.trim();
                const gia= row.cells[4].innerText.trim();
                    

                
                document.getElementById('materialName').value= namevl;
                document.getElementById('supplier').value= nameng;
                document.getElementById('quantity').value= sl;
                document.getElementById('unitPrice').value= gia;
                editVlieu.style.display='flex'
            }
        })

        document.getElementById('closeEditM').onclick = () => editVlieu.style.display = 'none';
        document.getElementById('cancelEditM').onclick = () => editVlieu.style.display = 'none';

        // xóa vật liệu
        const modalDltM = document.getElementById("modalDeleteM");
        document.querySelector('.material-table').addEventListener('click', function(e){
            if(e.target.classList.contains('fa-trash') || e.target.closest('.btn-delete-m')){
                modalDltM.style.display= 'flex';
                 
                const rowToDelete = e.target.closest('tr');
                document.getElementById('btnConfirmDeleteM').onclick = function() {
                    rowToDelete.remove(); 
                    modalDltM.style.display = 'none'; 
                };
            }
        });

    
        document.getElementById('btnCancelDeleteM').onclick = () => modalDltM.style.display = 'none';
        document.getElementById('closeDeleteM').onclick = () => modalDltM.style.display = 'none';

        // xoa user
        const modalDltUser = document.getElementById("modalDeleteUser");
        document.querySelector('.user-table').addEventListener('click', function(e){
            if(e.target.classList.contains('fa-trash') || e.target.closest('.btn-delete-user')){
                console.log("OK");
                modalDltUser.style.display= 'flex';
                 
                const rowToDelete = e.target.closest('tr');
                document.getElementById('btnConfirmDeleteU').onclick = function() {
                    rowToDelete.remove(); 
                    modalDltUser.style.display = 'none'; 
                };
            }
        });
        document.getElementById('btnCancelDeleteU').onclick = () => modalDltUser.style.display = 'none';
        document.getElementById('closeDeleteU').onclick = () => modalDltUser.style.display = 'none';

        // edit user
        const editUser= document.getElementById('editUserModal');

        document.querySelector(".user-table").addEventListener('click', (e)=>{
            if(e.target.classList.contains('fa-pen') || e.target.closest('.btn-edit-user')){
                const row= e.target.closest('tr');

                const name= row.cells[1].innerText.trim();
                const email = row.cells[2].innerText.trim();
                const role= row.cells[3].innerText.trim();
                const status= row.cells[4].innerText.trim();

                const roles= document.querySelectorAll(".role");
                roles.forEach(item =>{
                    if(item.text === role){
                        item.selected = true; // hien thi trong o
                    }
                });
                const statuss= document.querySelectorAll(".status");
                statuss.forEach(item =>{
                    if(item.text === status){
                        item.selected=true;
                    }
                });
                document.getElementById('fullName').value= name;
                document.getElementById('emailAddress').value= email;

                editUser.style.display='flex'
            }
        })

        document.getElementById('closeEditU').onclick = () => editUser.style.display = 'none';
        document.getElementById('cancelEditU').onclick = () => editUser.style.display = 'none';

        
        // edit san pham
        const modalEdit = document.getElementById('modalEditProduct');

       
        document.querySelector('.product-table').addEventListener('click', function(e) {
            if (e.target.classList.contains('fa-pen') || e.target.closest('.btn-edit')) {
                console.log("Ok");
                const row = e.target.closest('tr');
                const name = row.cells[1].innerText;
                const price = row.cells[2].innerText;
                const stock = row.cells[4].innerText;
                
                const categoryFromTable = row.cells[3].innerText.trim();
                const selectElem = document.getElementById('mySelectCategory');
                const options = selectElem.querySelectorAll('.category');

                options.forEach(item => {
                    if (item.text === categoryFromTable) {
                        item.selected = true;      // Chọn nó để hiển thị ở ô chính
                        // selectElem.prepend(item);  // Đưa nó lên đầu danh sách sổ xuống
                    }
                });
                document.getElementById('editName').value = name;
                document.getElementById('editPrice').value = price;
                document.getElementById('editStock').value = stock;
                modalEdit.style.display = 'flex';
            }
        });

        // Đóng modal
        document.getElementById('closeEdit').onclick = () => modalEdit.style.display = 'none';
        document.getElementById('btnCancelEdit').onclick = () => modalEdit.style.display = 'none';
        // document.querySelector('.btn-update').onclick = () => modalEdit.style.display = 'none';

        // xóa sản phẩm
        const modalDelete = document.getElementById('modalDeleteProduct');
        document.querySelector('.product-table').addEventListener('click', function(e) {
            if (e.target.classList.contains('fa-trash') || e.target.closest('.btn-delete')) {
                modalDelete.style.display = 'flex';
                                const rowToDelete = e.target.closest('tr');
                                document.getElementById('btnConfirmDelete').onclick = function() {
                    rowToDelete.remove(); // Xóa hàng khỏi giao diện
                    modalDelete.style.display = 'none'; // Đóng modal
                };
            }
        });
        document.getElementById('btnConfirmDelete').onclick = () => modalDelete.style.display = 'none';
        document.getElementById('btnCancelDelete').onclick = () => modalDelete.style.display = 'none';
        document.getElementById('closeDelete').onclick = () => modalDelete.style.display = 'none';


        // xóa danh mục
        const modalDC = document.getElementById("modalDeleteCategory");
        console.log(modalDC);
        document.querySelector('.category-table').addEventListener('click', function(e){
            if(e.target.classList.contains('fa-trash') || e.target.closest('.btn-delete-row')){
                console.log("OK");
                modalDC.style.display= 'flex';
                const rowToDelete = e.target.closest('tr');
                document.getElementById('btnConfirmDeleteCategory').onclick = function() {
                    rowToDelete.remove(); // Xóa hàng khỏi giao diện
                    modalDC.style.display = 'none'; // Đóng modal
                };
            }
        });

    
        // Đóng modal khi nhấn Cancel hoặc X
        document.getElementById('btnCancelDeleteCategory').onclick = () => modalDC.style.display = 'none';
        document.getElementById('btnConfirmDeleteCategory').onclick = () => modalDC.style.display = 'none';
        document.getElementById('closeDeleteC').onclick = () => modalDC.style.display = 'none';


        // edit category
        const modalEditCategory = document.getElementById('modalEditCategory');
        document.querySelector('.category-table').addEventListener('click', function(e) {
            if (e.target.classList.contains('fa-pen') || e.target.closest('.btn-edit')) {
                console.log("ok");
                const row = e.target.closest('tr');
                const name = row.cells[1].innerText.trim();
                console.log(name);
                const desc = row.cells[2].innerText.trim();
                
                document.querySelector('.editName').value = name;
                document.querySelector('.editMota').value = desc;


                // 4. Hiện Modal
                modalEditCategory.style.display = 'flex';
            }
        });
        document.getElementById('closeEditC').onclick = () => modalEditCategory.style.display = 'none';
        document.getElementById('cancelCategory').onclick = () => modalEditCategory.style.display = 'none';
        document.getElementById('editCategory').onclick = () => modalEditCategory.style.display = 'none';

        // xem chi tiết đơn hàng
        const modalDetailOrder= document.getElementById('orderDetailModal');
        document.querySelector('.order-table').addEventListener('click', (e)=>{
            if(e.target.classList.contains('fa-eye')){
                console.log("ok");
                const row= e.target.closest('tr');
                const id= row.cells[0].innerText.trim();
                const name= row.cells[1].innerText.trim();
                const tien= row.cells[2].innerText.trim();
                const status= row.cells[3].innerText.trim();
                const date= row.cells[4].innerText.trim();
                const tong= row.cells[5].innerText.trim();

                document.getElementById('det-order-id').innerText= id;
                document.getElementById('det-customer').innerText= name;
                document.getElementById('det-total').innerText= tien;
                document.getElementById('item-total').innerText= tong;
                document.getElementById('det-status').innerText= status;
                document.getElementById('det-date').innerText= date;



                let html=`
                    <li class="timeline-item completed">
                        <span class="dot"></span>
                        <p>Order placed - ${date}</p>
                    </li>
                `;
                if(status == "Pending" || status == "Completed"){
                    html+=`
                    <li class="timeline-item processing">
                        <span class="dot"></span>
                        <p>Processing</p>
                    </li>
                    `
                }
                else {
                    html+= `
                    <li class="timeline-item completed">
                        <span class="dot"></span>
                        <p>Delivered</p>
                    </li>
                    `
                }
                if(status== "Completed"){
                    html+=`
                    <li class="timeline-item processing">
                        <span class="dot"></span>
                        <p>Processing</p>
                    </li>
                    `
                }

                const a= document.querySelector('.timeline-list');
                a.innerHTML = html;

                modalDetailOrder.style.display = 'flex';
            }
        });
        document.getElementById('closeDetail').onclick = () => modalDetailOrder.style.display = 'none';

        // form thêm category
        
        // 1. Lấy các phần tử từ DOM
        const modalAddCategory = document.getElementById('modalOverlay');
        const btnOpen          = document.getElementById('btnOpenAddC'); // Nút kích hoạt mở form
        const btnAddd           = document.getElementById('btn-addC');      // Nút "Thêm danh mục"
        const btnCancell        = document.getElementById('btnCancelC');    // Nút "Trở về"
        const btnCloseX        = document.getElementById('btnCloseAddCategory'); // Nút "X"

        const categoryName     = document.getElementById('categoryName');
        const categoryDesc     = document.getElementById('categoryDescription');

        // 2. Hàm đóng Modal
        const closeModall = () => {
            modalAddCategory.style.display = 'none';
            // Reset form khi đóng để lần sau mở lại sẽ trống
            categoryName.value = '';
            categoryDesc.value = '';
        };

        // 3. Sự kiện mở Modal (Kiểm tra nếu nút tồn tại mới gán sự kiện)
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                modalAddCategory.style.display = 'flex';
            });
        }

        // 4. Sự kiện khi nhấn nút "Thêm danh mục"
        btnAddd.addEventListener('click', (e) => {
            // Nếu nút nằm trong <form>, dùng e.preventDefault() để không bị reload trang
            e.preventDefault(); 

            const data = {
                name: categoryName.value.trim(),
                description: categoryDesc.value.trim()
            };
            
            // Kiểm tra dữ liệu đầu vào
            if(!data.name) {
                alert("Vui lòng nhập tên danh mục!");
                categoryName.focus();
                return;
            }

            console.log("Dữ liệu chuẩn bị gửi:", data);

            // --- XỬ LÝ LOGIC LƯU DATA (API/AJAX) Ở ĐÂY ---
            
            alert("Thêm danh mục thành công!");
            closeModall(); // Đóng form sau khi hoàn tất
        });

        // 5. Các sự kiện đóng Modal
        btnCancell.addEventListener('click', closeModall);
        btnCloseX.addEventListener('click', closeModall);

        // Đóng khi click vào vùng tối bên ngoài form
        window.addEventListener('click', (e) => {
            if (e.target === modalAddCategory) {
                closeModall();
            }
        });

        // thêm người dùng

        const userModal    = document.getElementById('userModalOverlay');
        const userBtnOpen  = document.getElementById('btnOpenAddUser');
        const userBtnClose = document.getElementById('userBtnClose');
        const userBtnCancel = document.getElementById('userBtnCancel');
        const userBtnAdd    = document.getElementById('userBtnAdd');

        // Input fields
        const inputName   = document.getElementById('userFullName');
        const inputEmail  = document.getElementById('userEmail');
        const selectRole  = document.getElementById('userRole');
        const selectStatus = document.getElementById('userStatus');

        // Hàm đóng modal
        const closeUserModal = () => {
            userModal.style.display = 'none';
        };

        // Mở modal
        if (userBtnOpen) {
            userBtnOpen.addEventListener('click', () => {
                userModal.style.display = 'flex';
            });
        }

        // Xử lý thêm User
        userBtnAdd.addEventListener('click', () => {
            const userData = {
                fullName: inputName.value.trim(),
                email: inputEmail.value.trim(),
                role: selectRole.value,
                status: selectStatus.value
            };

            if (!userData.fullName || !userData.email) {
                alert("Vui lòng nhập đầy đủ Tên và Email!");
                return;
            }

            console.log("Dữ liệu User mới:", userData);
            
            // Giả lập thêm thành công
            alert("Đã thêm người dùng: " + userData.fullName);
            closeUserModal();
        });

        // Đóng modal
        userBtnClose.addEventListener('click', closeUserModal);
        userBtnCancel.addEventListener('click', closeUserModal);

        window.addEventListener('click', (e) => {
            if (e.target === userModal) {
                closeUserModal();
            }
        });


        // thêm vật liệu 
        // Các thành phần điều khiển modal
        const materialModal = document.getElementById('materialModalOverlay');
        const materialBtnOpen = document.getElementById('btnOpenAddMaterial');
        const materialBtnClose = document.getElementById('materialBtnClose');
        const materialBtnCancel = document.getElementById('materialBtnCancel');
        const materialBtnAdd = document.getElementById('materialBtnAdd');

        // Các trường nhập liệu
        const mNameInput = document.getElementById('materialNameInput');
        const mSupplierInput = document.getElementById('materialSupplierInput');
        const mQuantityInput = document.getElementById('materialQuantityInput');
        const mPriceInput = document.getElementById('materialPriceInput');

        // Hàm đóng modal
        const closeMaterialModal = () => {
            materialModal.style.display = 'none';
        };

        // Mở modal
        if (materialBtnOpen) {
            materialBtnOpen.addEventListener('click', () => {
                materialModal.style.display = 'flex';
            });
        }

        // Xử lý khi nhấn nút "Add Material"
        materialBtnAdd.addEventListener('click', () => {
            const materialData = {
                name: mNameInput.value.trim(),
                supplier: mSupplierInput.value.trim(),
                quantity: parseFloat(mQuantityInput.value) || 0,
                unitPrice: parseFloat(mPriceInput.value) || 0
            };

            // Kiểm tra nhanh
            if (!materialData.name) {
                alert("Vui lòng nhập tên nguyên liệu!");
                return;
            }

            console.log("Dữ liệu Material chuẩn bị gửi:", materialData);
            
            // Logic xử lý thêm vào database của bạn ở đây...
            alert("Đã thêm nguyên liệu thành công!");
            closeMaterialModal();
        });

        // Sự kiện đóng
        materialBtnClose.addEventListener('click', closeMaterialModal);
        materialBtnCancel.addEventListener('click', closeMaterialModal);

        // Đóng khi click ra ngoài
        window.addEventListener('click', (e) => {
            if (e.target === materialModal) {
                closeMaterialModal();
            }
        });
