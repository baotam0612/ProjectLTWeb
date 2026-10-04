package com.jewellery.ProjWEB;

import com.jewellery.ProjWEB.admin.pagination.AdminListService;
import com.jewellery.ProjWEB.admin.pagination.PageQuery;
import com.jewellery.ProjWEB.admin.category.controller.CategoryController;
import com.jewellery.ProjWEB.admin.category.service.CategoryService;
import com.jewellery.ProjWEB.admin.material.controller.MaterialController;
import com.jewellery.ProjWEB.admin.material.service.MaterialService;
import com.jewellery.ProjWEB.admin.order.controller.OrderController;
import com.jewellery.ProjWEB.admin.order.repository.OrderRepository;
import com.jewellery.ProjWEB.admin.order.service.OrderDetailService;
import com.jewellery.ProjWEB.admin.order.service.Impl.OrderServiceImpl;
import com.jewellery.ProjWEB.admin.payment.controller.PaymentController;
import com.jewellery.ProjWEB.admin.payment.service.PaymentService;
import com.jewellery.ProjWEB.admin.product.controller.ProductController;
import com.jewellery.ProjWEB.admin.product.model.request.ProductRequest;
import com.jewellery.ProjWEB.admin.product.repository.ProductRepository;
import com.jewellery.ProjWEB.admin.product.service.Impl.ProductServiceImpl;
import com.jewellery.ProjWEB.auth.controller.AdminController;
import com.jewellery.ProjWEB.config.ModelMapperConfig;
import com.jewellery.ProjWEB.entity.*;
import com.jewellery.ProjWEB.exception.GlobalExceptionHandler;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.order.model.dto.OrderRequest;
import com.jewellery.ProjWEB.user.order.service.Impl.UserOrderServiceImpl;
import com.jewellery.ProjWEB.user.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DataJpaTest(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.show-sql=false",
    "spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl"
}, showSql = false)
@Import({AdminListService.class, OrderServiceImpl.class, ModelMapperConfig.class,
        ProductServiceImpl.class, UserOrderServiceImpl.class})
class AdminPaginationInventoryTest {
    @Autowired EntityManager em;
    @Autowired AdminListService lists;
    @Autowired ProductServiceImpl productService;
    @Autowired OrderServiceImpl orderService;
    @Autowired UserOrderServiceImpl userOrderService;
    @Autowired ProductRepository products;
    @Autowired OrderRepository orders;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired AccountRepository accounts;
    @Autowired VerificationTokenRepository verificationTokens;
    @Autowired PasswordResetTokenRepository resetTokens;
    MockMvc mvc;
    CategoryEntity category;

    @BeforeEach void setup() {
        category = new CategoryEntity();
        category.setCategoryName("Ring"); category.setStatus("Active"); em.persist(category);
        mvc = MockMvcBuilders.standaloneSetup(
            new ProductController(productService, lists),
            new CategoryController(mock(CategoryService.class), lists),
            new MaterialController(mock(MaterialService.class), mock(CategoryService.class), lists),
            new OrderController(orderService, mock(OrderDetailService.class), lists),
            new PaymentController(mock(PaymentService.class), lists),
            new AdminController(lists, users, roles, new BCryptPasswordEncoder(), accounts, verificationTokens, resetTokens)
        ).setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    ProductEntity product(String name, int quantity) {
        ProductEntity product = new ProductEntity(); product.setProductName(name);
        product.setQuantity(quantity); product.setCategory(category); product.setPrice(BigDecimal.TEN);
        product.setStatus("Available"); product.setImageUrl("/image.jpg"); em.persist(product);
        return product;
    }
    User user(String name) {
        User user = User.builder().username(name).email(name + "@test.invalid").password("encoded")
            .fullName("Customer " + name).enabled(true).roles(Set.of()).build();
        em.persist(user); return user;
    }
    OrderEntity order(String status, ProductEntity product, int quantity, boolean reserved) {
        OrderEntity order = new OrderEntity(); order.setOrderStatus(status); order.setTotalAmount(BigDecimal.TEN);
        order.setInventoryReserved(reserved); order.setOrderDetails(new ArrayList<>()); em.persist(order);
        OrderDetailEntity detail = new OrderDetailEntity(); detail.setOrder(order); detail.setProduct(product);
        detail.setQuantity(quantity); detail.setPrice(BigDecimal.TEN); detail.setTotalAmount(BigDecimal.TEN);
        em.persist(detail); order.getOrderDetails().add(detail); return order;
    }
    PageQuery query(int page, int size) {
        PageQuery query = new PageQuery(); query.setPage(page); query.setSize(size); return query;
    }

    @Test void allSixEndpointsPaginateInTheDatabase() throws Exception {
        for (int i = 0; i < 25; i++) {
            ProductEntity product = product("Product " + i, 5);
            user("user" + i);
            CategoryEntity extra = new CategoryEntity(); extra.setCategoryName("Category " + i); em.persist(extra);
            MaterialEntity material = new MaterialEntity(); material.setMaterialName("Gold " + i); em.persist(material);
            OrderEntity order = order("Pending", product, 1, false);
            PaymentEntity payment = new PaymentEntity(); payment.setPaymentStatus("Failed");
            payment.setAmount(BigDecimal.TEN); payment.setOrder(order); em.persist(payment);
        }
        em.flush(); em.clear();
        for (String url : List.of("/api/admin/users", "/admin/products", "/admin/categorys",
                "/admin/materials", "/admin/orders", "/admin/payments")) {
            mvc.perform(get(url).param("page", "1").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.number").value(1))
                .andExpect(jsonPath("$.size").value(10)).andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.totalElements").value(url.endsWith("categorys") ? 26 : 25));
        }
        assertThat(lists.users(query(0, 10)).content().get(0).get("username")).isEqualTo("user24");
        assertThat(lists.users(query(0, 10)).content().get(0)).doesNotContainKey("password");
        mvc.perform(get("/admin/payments").param("page", "2").param("size", "10"))
            .andExpect(jsonPath("$.content.length()").value(5))
            .andExpect(jsonPath("$.summary.totalPayments").value(25))
            .andExpect(jsonPath("$.summary.totalAmount").value(250));
    }

    @Test void searchAndCategoryFilterApplyBeforePagination() {
        for (int i = 0; i < 24; i++) product("Other " + i, 1);
        product("Special 100%_Gold", 7);
        PageQuery query = query(0, 10); query.setQ("100%_gold"); query.setCategory("ring");
        var page = lists.products(query);
        assertThat(page.totalElements()).isEqualTo(1);
        assertThat(page.content().get(0).getQuantity()).isEqualTo(7);
        query.setCategory("Necklace"); assertThat(lists.products(query).totalElements()).isZero();
        query.setCategory("all"); query.setQ("no result"); assertThat(lists.products(query).content()).isEmpty();
    }

    @Test void orderAndPaymentFiltersHandleExistingStatuses() {
        ProductEntity product = product("Ring", 10);
        order("WAITING", product, 1, false); order("Completed", product, 1, false);
        OrderEntity canceled = order("Cancelled", product, 1, false);
        PaymentEntity payment = new PaymentEntity(); payment.setPaymentStatus("Success"); payment.setOrder(canceled);
        em.persist(payment);
        PageQuery query = query(0, 10); query.setStatus("pending");
        assertThat(lists.orders(query).totalElements()).isEqualTo(1);
        query.setStatus("canceled"); assertThat(lists.orders(query).totalElements()).isEqualTo(1);
        query.setStatus("Success"); assertThat(lists.payments(query).totalElements()).isEqualTo(1);
        query.setStatus("Failed"); assertThat(lists.payments(query).totalElements()).isZero();
    }

    @Test void invalidPageAndSizeReturnBadRequestAndOutOfRangeIsEmpty() throws Exception {
        mvc.perform(get("/admin/products").param("page", "-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/admin/products").param("page", "0").param("size", "101")).andExpect(status().isBadRequest());
        mvc.perform(get("/admin/products").param("page", "0").param("size", "0")).andExpect(status().isBadRequest());
        product("Ring", 3);
        assertThat(lists.products(query(100, 10)).content()).isEmpty();
    }

    @Test void createsAndUpdatesProductQuantityIncludingZero() {
        ProductRequest request = new ProductRequest(); request.setProductName("New Ring"); request.setCategoryName("Ring");
        request.setPrice(10); request.setImageUrl("/image.jpg"); request.setStatus("Available"); request.setQuantity(12);
        var dto = productService.addProduct(request);
        em.flush(); em.clear();
        assertThat(products.findById(dto.getId()).orElseThrow().getQuantity()).isEqualTo(12);
        assertThat(dto.getCategoryName()).isEqualTo("Ring");
        request.setQuantity(0); assertThat(productService.updateProduct(dto.getId(), request).getQuantity()).isZero();
        request.setQuantity(null); assertThat(productService.updateProduct(dto.getId(), request).getQuantity()).isZero();
        request.setQuantity(-1); assertThatThrownBy(() -> productService.updateProduct(dto.getId(), request))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test void placingOrderReservesStockAndRejectsInsufficientOrInvalidQuantity() {
        ProductEntity product = product("Ring", 5); user("buyer");
        OrderRequest request = new OrderRequest(product.getId(), 3, "Address", "COD");
        userOrderService.placeOrder(request, "buyer");
        assertThat(product.getQuantity()).isEqualTo(2);
        assertThat(orders.findAll()).hasSize(1).allMatch(OrderEntity::isInventoryReserved);
        request.setQuantity(3);
        assertThatThrownBy(() -> userOrderService.placeOrder(request, "buyer")).isInstanceOf(IllegalArgumentException.class);
        assertThat(product.getQuantity()).isEqualTo(2); assertThat(orders.count()).isEqualTo(1);
        request.setQuantity(0);
        assertThatThrownBy(() -> userOrderService.placeOrder(request, "buyer")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test void cancellationRestoresStockOnceAndReopeningReservesAgain() {
        ProductEntity product = product("Ring", 2);
        OrderEntity order = order("Pending", product, 3, true);
        orderService.updateOrderStatus(order.getOrderID(), "Canceled"); assertThat(product.getQuantity()).isEqualTo(5);
        orderService.updateOrderStatus(order.getOrderID(), "Canceled"); assertThat(product.getQuantity()).isEqualTo(5);
        orderService.updateOrderStatus(order.getOrderID(), "Pending"); assertThat(product.getQuantity()).isEqualTo(2);
        orderService.updateOrderStatus(order.getOrderID(), "Completed"); assertThat(product.getQuantity()).isEqualTo(2);
    }

    @Test void legacyOrderCancellationDoesNotInventStockAndReopeningChecksAvailability() {
        ProductEntity product = product("Ring", 1);
        OrderEntity order = order("Pending", product, 3, false);
        orderService.updateOrderStatus(order.getOrderID(), "Canceled"); assertThat(product.getQuantity()).isEqualTo(1);
        assertThatThrownBy(() -> orderService.updateOrderStatus(order.getOrderID(), "Pending"))
            .isInstanceOf(IllegalArgumentException.class);
        assertThat(product.getQuantity()).isEqualTo(1);
    }

    @Test void repeatedProductLinesRestoreAndReserveTheCombinedQuantity() {
        ProductEntity product = product("Ring", 2);
        OrderEntity order = order("Pending", product, 2, true);
        OrderDetailEntity extra = new OrderDetailEntity(); extra.setOrder(order); extra.setProduct(product);
        extra.setQuantity(3); extra.setPrice(BigDecimal.TEN); extra.setTotalAmount(BigDecimal.TEN);
        em.persist(extra); order.getOrderDetails().add(extra);
        orderService.updateOrderStatus(order.getOrderID(), "Canceled"); assertThat(product.getQuantity()).isEqualTo(7);
        orderService.updateOrderStatus(order.getOrderID(), "Pending"); assertThat(product.getQuantity()).isEqualTo(2);
    }

    @Test void deletingProductWithHistoricalOrderIsRejected() {
        ProductEntity product = product("Ring", 1); product.setStatus("Unavailable");
        order("Completed", product, 1, false); em.flush();
        assertThatThrownBy(() -> productService.deleteProduct(product.getId())).isInstanceOf(IllegalArgumentException.class);
        assertThat(products.existsById(product.getId())).isTrue(); assertThat(orders.count()).isEqualTo(1);
    }
}
