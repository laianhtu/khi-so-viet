"use client";

import { type FormEvent, type MouseEvent, useEffect, useMemo, useState } from "react";

type Product = {
  name: string;
  seller: string;
  price: number;
  category: string;
  visual: string;
  emblem: string;
  badge: string;
  sold: string;
};

type Account = { name: string; email: string; password: string };

type HoldOrder = {
  id: string;
  item: string;
  buyer: string;
  amount: number;
  createdAt: string;
  releaseAt: string;
};

const products: Product[] = [
  { name: "Canva Pro · 12 tháng", seller: "Design Hub", price: 89000, category: "Phần mềm", visual: "pv-purple", emblem: "C", badge: "BÁN CHẠY", sold: "Đã bán 1.2k" },
  { name: "Steam Wallet 500.000đ", seller: "GameBox VN", price: 485000, category: "Game", visual: "pv-blue", emblem: "S", badge: "-8%", sold: "Đã bán 856" },
  { name: "Microsoft 365 Personal", seller: "Key Station", price: 159000, category: "Phần mềm", visual: "pv-orange", emblem: "M", badge: "MỚI", sold: "Đã bán 643" },
  { name: "Tài khoản CapCut Pro", seller: "S-H Agency", price: 49000, category: "Tài khoản", visual: "pv-dark", emblem: "✂", badge: "BÁN CHẠY", sold: "Đã bán 2.4k" },
  { name: "Spotify Premium · 6 tháng", seller: "Digital Plus", price: 119000, category: "Dịch vụ", visual: "pv-green", emblem: "◉", badge: "GIÁ TỐT", sold: "Đã bán 1.1k" },
  { name: "Kho template thiết kế 2026", seller: "Mia Creative", price: 79000, category: "Tài liệu", visual: "pv-pink", emblem: "✦", badge: "MỚI", sold: "Đã bán 380" },
];

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + "đ";
const ACCOUNTS_KEY = "ksv.accounts.v1";
const CURRENT_USER_KEY = "ksv.current-user.v1";
const sampleHoldOrders: HoldOrder[] = [
  { id: "KSV-2041", item: "Canva Pro · 12 tháng", buyer: "Mai N.", amount: 89000, createdAt: "19/07/2026", releaseAt: "24/07/2026" },
  { id: "KSV-2038", item: "Steam Wallet 500.000đ", buyer: "Hoàng P.", amount: 485000, createdAt: "18/07/2026", releaseAt: "23/07/2026" },
  { id: "KSV-2029", item: "Microsoft 365 Personal", buyer: "Linh T.", amount: 159000, createdAt: "17/07/2026", releaseAt: "22/07/2026" },
];

function readAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ACCOUNTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("popular");
  const [priceCap, setPriceCap] = useState(1000000);
  const [wishlisted, setWishlisted] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [amountReady, setAmountReady] = useState(false);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [depositMessage, setDepositMessage] = useState("");
  const [depositError, setDepositError] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [sellerTab, setSellerTab] = useState("overview");
  const [sellerMessage, setSellerMessage] = useState("");
  const [sellerListings, setSellerListings] = useState<Array<{ title: string; price: number; category: string }>>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedUser = window.localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
      } catch {
        window.localStorage.removeItem(CURRENT_USER_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const transferContent = `KSV ${amount || 0} NAPTIEN`;
  const filtered = useMemo(() => products
    .filter((product) => (category === "Tất cả" || product.category === category)
      && product.name.toLowerCase().includes(query.toLowerCase())
      && product.price <= priceCap)
    .sort((a, b) => sort === "price" ? a.price - b.price : sort === "new" ? b.name.localeCompare(a.name) : sort === "rating" ? b.seller.localeCompare(a.seller) : 0),
  [category, priceCap, query, sort]);

  const holdTotal = useMemo(() => sampleHoldOrders.reduce((total, order) => total + order.amount, 0), []);
  const cartTotal = useMemo(() => cartItems.reduce((total, product) => total + product.price, 0), [cartItems]);
  const cartCount = cartItems.length;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function openLogin() {
    setLoginOpen(true);
    setRegisterOpen(false);
    setAuthMessage("");
    setAuthError(false);
  }

  function openRegister() {
    setRegisterOpen(true);
    setLoginOpen(false);
    setAuthMessage("");
    setAuthError(false);
  }

  function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("displayName") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    if (!name || !email || password.length < 6) {
      setAuthMessage("Vui lòng nhập đủ thông tin; mật khẩu cần ít nhất 6 ký tự.");
      setAuthError(true);
      return;
    }
    const accounts = readAccounts();
    if (accounts.some((account) => account.email === email)) {
      setAuthMessage("Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.");
      setAuthError(true);
      return;
    }
    const account = { name, email, password };
    accounts.push(account);
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ name, email }));
    setCurrentUser({ name, email });
    setRegisterOpen(false);
    setAuthMessage("");
    setAuthError(false);
    notify("Đăng ký thành công, bạn đã được đăng nhập.");
  }

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const account = readAccounts().find((item) => item.email === email && item.password === password);
    if (!account) {
      setAuthMessage("Email hoặc mật khẩu chưa đúng. Nếu chưa có tài khoản, hãy đăng ký trước.");
      setAuthError(true);
      return;
    }
    const user = { name: account.name, email: account.email };
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setLoginOpen(false);
    setAuthMessage("");
    setAuthError(false);
    notify(`Chào mừng ${account.name} quay lại.`);
  }

  function logout() {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
    notify("Bạn đã đăng xuất.");
  }

  function openSellerCenter() {
    setSellerOpen(true);
    setSellerTab("overview");
    setSellerMessage("");
  }

  function submitListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("listingTitle") || "").trim();
    const categoryValue = String(form.get("listingCategory") || "Phần mềm");
    const price = Number(form.get("listingPrice") || 0);
    if (!title || price < 1000) {
      setSellerMessage("Vui lòng nhập tên sản phẩm và giá từ 1.000đ.");
      return;
    }
    setSellerListings((items) => [...items, { title, price, category: categoryValue }]);
    setSellerMessage(`Đã đưa “${title}” vào danh sách chờ duyệt.`);
    event.currentTarget.reset();
  }

  function openDeposit(event?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    event?.preventDefault();
    setDepositOpen(true);
    setAmount(0);
    setAmountReady(false);
    setQrFailed(false);
    setDepositMessage("");
    setDepositError(false);
  }

  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    event.preventDefault();
    setMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openDepositLink(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setMenuOpen(false);
    openDeposit();
  }

  function selectAmount(value: number) {
    setAmount(value);
    setAmountReady(false);
    setDepositMessage("");
    setDepositError(false);
  }

  function continueToQr() {
    if (amount < 10000) {
      setDepositMessage("Số tiền nạp tối thiểu là 10.000đ.");
      setDepositError(true);
      return;
    }
    setDepositMessage("");
    setDepositError(false);
    setQrFailed(false);
    setAmountReady(true);
  }

  async function copyTransferContent() {
    try {
      await navigator.clipboard.writeText(transferContent);
      setDepositMessage("Đã sao chép nội dung chuyển khoản.");
      setDepositError(false);
    } catch {
      setDepositMessage("Không thể tự sao chép, hãy bôi đen nội dung để copy.");
      setDepositError(true);
    }
  }

  function submitDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount < 10000) {
      setDepositMessage("Số tiền nạp tối thiểu là 10.000đ.");
      setDepositError(true);
      return false;
    }
    if (reference.trim().length < 4) {
      setDepositMessage("Vui lòng nhập mã giao dịch hoặc 4 số cuối tài khoản.");
      setDepositError(true);
      return false;
    }
    setDepositMessage(`Đã gửi NAP-${Date.now().toString().slice(-6)} — ${money(amount)}. Quản trị viên sẽ đối chiếu.`);
    setDepositError(false);
    setReference("");
    setNote("");
    notify("Yêu cầu nạp tiền đã được ghi nhận.");
    return true;
  }

  function addToCart(product: Product) {
    if (cartItems.some((item) => item.name === product.name)) {
      notify("Sản phẩm này đã có trong giỏ hàng.");
      return;
    }
    setCartItems([...cartItems, product]);
    notify(`Đã thêm “${product.name}” vào giỏ hàng.`);
  }

  function removeFromCart(productName: string) {
    setCartItems((items) => items.filter((item) => item.name !== productName));
    notify("Đã bỏ sản phẩm khỏi giỏ hàng.");
  }

  function toggleWishlist(product: Product) {
    setWishlisted((items) => items.includes(product.name) ? items.filter((item) => item !== product.name) : [...items, product.name]);
  }

  return (
    <main className="site-shell" id="top">
      <div className="top-strip"><div className="container top-strip-inner"><span><span className="spark">✦</span> MMO Digital Market — giao dịch an toàn 24/7</span><div className="top-links"><a href="#deposit" onClick={openDepositLink}>Nạp tiền</a><span>•</span><a href="#support" onClick={(event) => scrollToSection(event, "support")}>Hỗ trợ</a></div></div></div>

      <header className="site-header"><div className="container nav-wrap">
        <a className="brand" href="#top" aria-label="Kho Số Việt"><span className="brand-mark"><span></span><span></span><span></span></span><span className="brand-name">KHO SỐ <span>VIỆT</span></span></a>
        <nav className={`main-nav ${menuOpen ? "mobile-open" : ""}`} aria-label="Điều hướng chính"><a className="active" href="#top" onClick={(event) => scrollToSection(event, "top")}>Trang chủ</a><a href="#market" onClick={(event) => scrollToSection(event, "market")}>Sản phẩm</a><a href="#categories" onClick={(event) => scrollToSection(event, "categories")}>Danh mục</a><a href="#deposit" onClick={openDepositLink}>Nạp tiền</a><a href="#seller" onClick={(event) => scrollToSection(event, "seller")}>Bán hàng</a><a href="#support" onClick={(event) => scrollToSection(event, "support")}>Hỗ trợ</a></nav>
        <div className="nav-actions"><button className="deposit-shortcut" type="button" onClick={() => openDeposit()}>Nạp tiền</button><button className="icon-btn" type="button" onClick={() => setCartOpen(true)} aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}>⌑{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>{currentUser ? <button className="user-chip" type="button" onClick={logout} title="Bấm để đăng xuất"><span>{currentUser.name.slice(0, 1).toUpperCase()}</span>{currentUser.name} · Thoát</button> : <><button className="login-btn" type="button" onClick={openLogin}>Đăng nhập <span className="arrow">→</span></button><button className="register-btn" type="button" onClick={openRegister}>Đăng ký</button></>}<button className="mobile-menu" type="button" aria-label="Mở menu" onClick={() => setMenuOpen(!menuOpen)}><span></span><span></span><span></span></button></div>
      </div></header>

      <section className="hero container"><div className="hero-copy"><div className="eyebrow"><span className="status-dot"></span> KHO SỐ VIỆT · MMO DIGITAL MARKET</div><h1>Hệ sinh thái MMO.<br /><em>Giao dịch tốc độ.</em></h1><p className="hero-text">Tài khoản, key, tool và dịch vụ số cho game thủ, creator và người làm MMO. Nạp ví minh bạch, nhận hàng nhanh, seller quản lý đơn ngay trong một nơi.</p><div className="hero-actions"><a className="primary-btn" href="#market" onClick={(event) => scrollToSection(event, "market")}>Khám phá chợ MMO <span>↗</span></a><a className="ghost-btn" href="#deposit" onClick={openDepositLink}><span className="play">↗</span> Nạp tiền vào ví</a></div><div className="hero-trust"><div className="avatar-stack"><span className="avatar a1">AN</span><span className="avatar a2">L</span><span className="avatar a3">ĐN</span><span className="avatar a4">+</span></div><div><strong>50.000+</strong><small> người dùng</small></div><div className="stars">★★★★★ <small>4.9/5</small></div></div></div><div className="hero-art"><div className="orbit orbit-a"></div><div className="orbit orbit-b"></div><div className="hero-card hero-card-main"><div className="card-top"><span className="mini-label">GIAO DỊCH MMO #KSV-8824</span><span className="live">● LIVE</span></div><div className="big-orb"><span className="orb-core">K</span><span className="orbit-dot dot-one"></span><span className="orbit-dot dot-two"></span></div><div className="transaction"><div><small>Đang giao dịch</small><strong>Steam Wallet 500K</strong></div><div className="price">485.000đ</div></div><div className="secure-line"><span>✓</span> Seller xác minh · Giao tức thì <span className="tiny-arrow">↗</span></div></div><div className="float-card seller-float"><span className="float-icon">✦</span><div><small>Đang bán chạy</small><strong>Tool &amp; key game</strong></div><b>+28%</b></div><div className="float-card rating-float"><span className="rating-star">★</span><div><strong>4.9</strong><small> 12.4k đánh giá</small></div></div><div className="hero-grid"></div></div></section>

      <section className="trust-bar"><div className="container trust-grid"><div className="trust-item"><span className="trust-icon shield">◈</span><div><strong>100% an toàn</strong><small>Bảo vệ giao dịch</small></div></div><div className="trust-item"><span className="trust-icon bolt">ϟ</span><div><strong>Giao hàng tức thì</strong><small>Tự động 24/7</small></div></div><div className="trust-item"><span className="trust-icon support">◌</span><div><strong>Hỗ trợ tận tâm</strong><small>Luôn sẵn sàng</small></div></div><div className="trust-item"><span className="trust-icon check">✓</span><div><strong>Người bán xác minh</strong><small>Nguồn gốc rõ ràng</small></div></div></div></section>

      <section id="categories" className="section container categories-section"><div className="section-heading"><div><div className="eyebrow muted">KHÁM PHÁ THEO NHU CẦU</div><h2>Danh mục <span>phổ biến</span></h2></div><a className="text-link" href="#market" onClick={(event) => scrollToSection(event, "market")}>Xem tất cả <span>↗</span></a></div><div className="category-grid">{["Phần mềm", "Tài khoản", "Game", "Dịch vụ", "Tài liệu"].map((item, index) => <button type="button" className={`category-card ${["cat-purple", "cat-blue", "cat-orange", "cat-green", "cat-pink"][index]}`} key={item} onClick={() => { setCategory(item); document.getElementById("market")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><span className="category-graphic"><i>{["✦", "◎", "✚", "◈", "⌘"][index]}</i><i>{["◒", "⌁", "◌", "✧", "✦"][index]}</i></span><span><strong>{item}</strong><small>{["1.240", "860", "2.510", "1.075", "640"][index]} sản phẩm</small></span><b>↗</b></button>)}</div></section>

      <section id="market" className="section container marketplace-section"><div className="section-heading"><div><div className="eyebrow muted">ĐƯỢC CỘNG ĐỒNG YÊU THÍCH</div><h2>Sản phẩm <span>nổi bật</span></h2></div><a className="text-link" href="#deposit" onClick={openDepositLink}>Nạp tiền trước <span>↗</span></a></div><div className="market-toolbar"><div className="filter-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" /></div><div className="tabs">{[["popular", "Bán chạy"], ["new", "Mới cập nhật"], ["price", "Giá tốt"], ["rating", "Đánh giá cao"]].map(([value, label]) => <button type="button" className={`tab ${sort === value ? "active" : ""}`} key={value} onClick={() => setSort(value)}>{label}</button>)}</div></div><div className="market-subtools"><div className="category-pills">{["Tất cả", "Phần mềm", "Tài khoản", "Game", "Dịch vụ", "Tài liệu"].map((item) => <button type="button" className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="price-limit">Lọc nhanh theo giá <select value={priceCap} onChange={(event) => setPriceCap(Number(event.target.value))}><option value={1000000}>Tất cả mức giá</option><option value={50000}>Dưới 50k</option><option value={100000}>Dưới 100k</option><option value={250000}>100k - 250k</option><option value={500000}>250k - 500k</option></select></label></div><div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.name}><div className={`product-visual ${product.visual}`}><span className="product-badge">{product.badge}</span><button className={`wishlist ${wishlisted.includes(product.name) ? "liked" : ""}`} type="button" onClick={() => toggleWishlist(product)} aria-label="Yêu thích">{wishlisted.includes(product.name) ? "♥" : "♡"}</button><span className="product-emblem">{product.emblem}</span></div><div className="product-info"><h3>{product.name}</h3><div className="seller-line"><b>{product.seller}</b><span className="verified">✓</span><span>· ★ 4.9</span></div><div className="product-bottom"><div><div className="product-price">{money(product.price)}</div><div className="product-sold">{product.sold}</div></div><button className="add-cart" type="button" onClick={() => addToCart(product)} aria-label={`Thêm ${product.name} vào giỏ`}>+</button></div></div></article>)}</div>{filtered.length === 0 && <div className="empty-state">Không tìm thấy sản phẩm phù hợp.</div>}<div className="load-more"><button type="button" onClick={() => { setPriceCap(1000000); setCategory("Tất cả"); setQuery(""); notify("Đã hiển thị toàn bộ sản phẩm."); }}>Xem tất cả sản phẩm <span>↗</span></button></div></section>

      <section className="section container featured-sellers"><div className="section-heading"><div><div className="eyebrow muted">GIAN HÀNG ĐƯỢC TIN CHỌN</div><h2>Người bán <span>uy tín</span></h2></div><a className="text-link" href="#seller" onClick={(event) => scrollToSection(event, "seller")}>Trở thành người bán <span>↗</span></a></div><div className="sellers-grid"><article className="seller-tile"><div className="seller-avatar purple">SH</div><div><strong>S-H AGENCY</strong><small><span className="verified">✓</span> 4.9 · 128 đơn</small></div><b>↗</b></article><article className="seller-tile"><div className="seller-avatar blue">TH</div><div><strong>TH MMO STORE</strong><small><span className="verified">✓</span> 4.8 · 96 đơn</small></div><b>↗</b></article><article className="seller-tile"><div className="seller-avatar green">DC</div><div><strong>DIGITAL PLUS</strong><small><span className="verified">✓</span> 5.0 · 210 đơn</small></div><b>↗</b></article><article className="seller-tile priority"><div className="seller-avatar orange">✦</div><div><strong>Gian hàng ưu tiên</strong><small>Liên hệ để được xác minh</small></div><b>↗</b></article></div></section>

      <section className="about-section"><div className="container about-inner"><div className="about-copy"><div className="eyebrow muted">KHO SỐ VIỆT · MMO COMMERCE</div><h2>Một chợ MMO<br /><span>rõ ràng &amp; an tâm.</span></h2><p>Kết nối người mua với seller uy tín cho tài khoản, key, tool và dịch vụ số. Mỗi sản phẩm có mô tả, trạng thái đơn và quy trình giữ tiền rõ ràng.</p></div><div className="about-cards"><article><span>01</span><strong>Mua sản phẩm MMO</strong><small>Chọn từ các gian hàng được xác minh.</small></article><article><span>02</span><strong>Mở gian hàng</strong><small>Đăng sản phẩm, quản lý đơn và doanh thu.</small></article><article><span>03</span><strong>Giữ tiền an toàn</strong><small>Đơn hoàn tất, chờ 5 ngày rồi giải ngân seller.</small></article></div></div></section>

      <section className="section container workflow-section"><div className="section-heading"><div><div className="eyebrow muted">ĐƠN GIẢN · NHANH CHÓNG · TỰ ĐỘNG</div><h2>Quy trình giao dịch <span>an toàn</span></h2></div><a className="text-link" href="#deposit" onClick={openDepositLink}>Bắt đầu ngay <span>↗</span></a></div><div className="workflow-grid"><article><span>01</span><strong>Chọn sản phẩm</strong><small>Tìm và chọn sản phẩm phù hợp nhu cầu.</small></article><article><span>02</span><strong>Thanh toán</strong><small>Thanh toán bằng số dư ví an toàn.</small></article><article><span>03</span><strong>Nhận hàng</strong><small>Hệ thống giao sản phẩm ngay lập tức.</small></article><article><span>04</span><strong>Đánh giá</strong><small>Xác nhận và nhận hỗ trợ khi cần.</small></article></div></section>

      <section className="section container community-section"><div className="section-heading"><div><div className="eyebrow muted">GÓC CỘNG ĐỒNG</div><h2>Đang được <span>quan tâm</span></h2></div><a className="text-link" href="#support" onClick={(event) => scrollToSection(event, "support")}>Xem diễn đàn <span>↗</span></a></div><div className="community-grid"><article className="discussion-card featured-discussion"><div className="discussion-meta"><span className="topic-icon">✦</span><span>Thảo luận nổi bật</span><time>2 giờ trước</time></div><h3>Chia sẻ cách săn deal phần mềm chính hãng mùa hè này</h3><p>Cùng trao đổi những ưu đãi tốt và kinh nghiệm mua hàng an toàn...</p><div className="discussion-foot"><span>24 phản hồi</span><b>↗</b></div></article><article className="discussion-card"><div className="discussion-meta"><span className="topic-icon green">◌</span><span>Hỏi đáp</span><time>5 giờ trước</time></div><h3>Gói Canva Pro này dùng được bao lâu?</h3><div className="discussion-foot"><span>8 phản hồi</span><b>↗</b></div></article><article className="discussion-card"><div className="discussion-meta"><span className="topic-icon orange">◈</span><span>Kinh nghiệm</span><time>Hôm qua</time></div><h3>Tips tối ưu gian hàng để tăng chuyển đổi</h3><div className="discussion-foot"><span>16 phản hồi</span><b>↗</b></div></article></div></section>

      <section className="tags-section"><div className="container tags-inner"><span>TỪ KHÓA PHỔ BIẾN</span>{["Steam", "Google Play", "Microsoft 365", "Canva Pro", "Spotify", "Netflix", "Adobe", "Notion", "Discord Nitro"].map((tag) => <button type="button" key={tag} onClick={() => { setQuery(tag); document.getElementById("market")?.scrollIntoView({ behavior: "smooth" }); }}>{tag}</button>)}</div></section>

      <section id="seller" className="seller-section"><div className="container seller-inner"><div className="seller-copy"><div className="eyebrow">DÀNH CHO NGƯỜI BÁN</div><h2>Biến đam mê<br />thành <em>thu nhập.</em></h2><p>Mở gian hàng miễn phí, tiếp cận khách hàng và quản lý mọi thứ trong một nơi.</p><div className="seller-benefits"><span>✓ Không phí duy trì</span><span>✓ Thanh toán nhanh</span><span>✓ Dashboard minh bạch</span><span>✓ Giữ tiền 5 ngày an toàn</span></div><button className="primary-btn" type="button" onClick={openSellerCenter}>Mở Seller Center <span>↗</span></button></div><div className="seller-dashboard"><div className="dash-head"><span><i></i> Bảng điều khiển</span><span className="dash-week">Tuần này⌄</span></div><div className="dash-total"><small>Doanh thu</small><strong>18.420.000đ</strong><span className="positive">↗ 24.8%</span></div><div className="chart"><span className="chart-label l1">20tr</span><span className="chart-label l2">10tr</span><div className="bar b1"></div><div className="bar b2"></div><div className="bar b3"></div><div className="bar b4"></div><div className="bar b5"></div><div className="bar b6"></div><div className="bar b7"></div><div className="chart-line"></div><div className="chart-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div className="dash-footer"><span>Đang giữ <b>{money(holdTotal)} · 5 ngày</b></span><span>Đơn hàng <b>+128</b></span></div></div></div></section>

      {sellerOpen && (
        <div className="seller-modal open">
          <button className="modal-overlay" type="button" aria-label="Đóng Seller Center" onClick={() => setSellerOpen(false)} />
          <section className="seller-modal-card" aria-label="Seller Center">
            <div className="seller-modal-head"><div><div className="eyebrow muted">SELLER CENTER · KHO SỐ VIỆT</div><h2>Quản lý <span>gian hàng</span></h2><p>{currentUser ? `Xin chào ${currentUser.name}.` : "Bảng điều khiển người bán demo"}</p></div><button type="button" onClick={() => setSellerOpen(false)}>×</button></div>
            <div className="seller-tabs" role="tablist">{[["overview", "Tổng quan"], ["products", "Sản phẩm"], ["orders", "Đơn hàng"], ["wallet", "Ví tiền"]].map(([value, label]) => <button key={value} type="button" className={sellerTab === value ? "active" : ""} onClick={() => setSellerTab(value)}>{label}</button>)}</div>
            <div className="seller-tab-context"><strong>{sellerTab === "overview" ? "Tổng quan seller" : sellerTab === "products" ? "Quản lý sản phẩm" : sellerTab === "orders" ? "Theo dõi đơn hàng" : "Ví tiền & giải ngân"}</strong><span>{sellerTab === "overview" ? "Theo dõi toàn bộ gian hàng trong một màn hình." : sellerTab === "products" ? "Đăng, cập nhật và gửi sản phẩm chờ duyệt." : sellerTab === "orders" ? "Kiểm tra trạng thái giao hàng và thời điểm nhận tiền." : "Tiền hoàn tất sẽ được giải ngân sau 5 ngày an toàn."}</span></div>
            <div className="seller-summary-grid"><article><small>Số dư khả dụng</small><strong>3.240.000đ</strong><span>Rút ngay khi đủ điều kiện</span></article><article className="hold-summary"><small>Đang tạm giữ</small><strong>{money(holdTotal)}</strong><span>Giải ngân sau 5 ngày</span></article><article><small>Đơn hoàn tất</small><strong>128</strong><span>Đánh giá 4.9/5</span></article></div>
            <div className="seller-policy"><span className="policy-icon">⏱</span><div><strong>Quy tắc giữ tiền 5 ngày</strong><p>Sau khi đơn được giao thành công, tiền sẽ ở trạng thái “Đang giữ” trong 5 ngày để xử lý khiếu nại. Hết thời hạn, tiền tự chuyển sang số dư khả dụng.</p></div></div>
            <div className="seller-modal-grid"><div className="seller-orders-card"><div className="seller-card-title"><div><strong>Đơn đang giữ</strong><small>Theo dõi thời điểm giải ngân</small></div><span>3 đơn</span></div><div className="seller-order-list">{sampleHoldOrders.map((order) => <article className="seller-order-row" key={order.id}><div><strong>{order.item}</strong><small>{order.id} · Người mua {order.buyer}</small></div><div><b>{money(order.amount)}</b><small className="hold-label">Đang giữ · đến {order.releaseAt}</small></div></article>)}</div></div><div className="seller-listing-card"><div className="seller-card-title"><div><strong>Đăng sản phẩm</strong><small>Gửi duyệt trong vài giây</small></div><span>Miễn phí</span></div><form className="seller-listing-form" onSubmit={submitListing}><label>Tên sản phẩm<input name="listingTitle" required placeholder="Ví dụ: Tài khoản thiết kế Pro" /></label><div className="seller-form-row"><label>Giá bán<input name="listingPrice" required type="number" min="1000" step="1000" placeholder="89.000" /></label><label>Danh mục<select name="listingCategory" defaultValue="Phần mềm"><option>Phần mềm</option><option>Tài khoản</option><option>Game</option><option>Dịch vụ</option></select></label></div><button className="primary-btn" type="submit">Đưa lên gian hàng <span>↗</span></button></form>{sellerListings.length > 0 && <div className="seller-new-listings"><strong>Chờ duyệt ({sellerListings.length})</strong>{sellerListings.slice(-2).map((listing) => <span key={`${listing.title}-${listing.price}`}>{listing.title} · {money(listing.price)}</span>)}</div>}</div></div>
            {sellerMessage && <p className="seller-message" role="status">{sellerMessage}</p>}
          </section>
        </div>
      )}

      {depositOpen && (
        <div className="deposit-modal open">
          <button className="modal-overlay" type="button" aria-label="Đóng nạp tiền" onClick={() => setDepositOpen(false)} />
          <div className="deposit-modal-card">
            <div className="deposit-modal-head"><div><div className="eyebrow muted">NẠP TIỀN VÀO VÍ</div><h2>{amountReady ? "Quét QR để nạp" : "Nhập số tiền nạp"}</h2></div><button type="button" onClick={() => setDepositOpen(false)}>×</button></div>
            {!amountReady ? (
              <div className="deposit-first-step"><div className="deposit-form-head"><span className="step-pill">01</span><div><strong>Chọn số tiền trước</strong><small>Tối thiểu 10.000đ, QR sẽ hiện sau bước này.</small></div></div><div className="amount-grid">{[10000, 50000, 100000, 200000, 500000, 1000000].map((value) => <button type="button" className={`amount-option ${amount === value ? "active" : ""}`} key={value} onClick={() => selectAmount(value)}>{money(value)}</button>)}<label className="amount-custom"><span>Nhập số tiền khác</span><input type="number" min="10000" step="1000" value={amount || ""} onChange={(event) => { setAmount(Number(event.target.value)); setAmountReady(false); }} placeholder="Tối thiểu 10.000" /><b>đ</b></label></div><p className={`deposit-message ${depositError ? "error" : ""}`} role="status">{depositMessage || "Số tiền nạp tối thiểu là 10.000đ."}</p><button className="primary-btn deposit-continue" type="button" onClick={continueToQr}>Tiếp tục đến QR <span>→</span></button></div>
            ) : (
              <div className="deposit-qr-step"><div className="deposit-card"><div className="deposit-qr-wrap"><div className="deposit-qr-head"><span className="qr-lock">▣</span><div><strong>Quét QR Techcombank</strong><small>Số tiền: {money(amount)}</small></div></div>{qrFailed ? <div className="qr-fallback"><strong>QR chưa tải được</strong><small>Bấm nút bên dưới để mở ảnh QR riêng.</small><a href="/qr-techcombank.jpg?rev=5" target="_blank" rel="noreferrer">Mở QR riêng ↗</a></div> : <img className="deposit-qr" src="/qr-techcombank.jpg?rev=5" alt="Mã QR Techcombank để nạp tiền" onError={() => setQrFailed(true)} onLoad={() => setQrFailed(false)} decoding="sync" fetchPriority="high" /> }<button className="copy-bank" type="button" onClick={copyTransferContent}>Sao chép nội dung <span>⧉</span></button></div><div className="deposit-form-wrap"><div className="transfer-box"><span className="transfer-label">NỘI DUNG CHUYỂN KHOẢN</span><strong>{transferContent}</strong><button type="button" onClick={copyTransferContent} aria-label="Sao chép nội dung">⧉</button><small>Quét QR rồi kiểm tra số tiền và nội dung trước khi chuyển.</small></div><form className="deposit-request-form" onSubmit={(event) => { if (submitDeposit(event)) setDepositOpen(false); }}><label>Mã giao dịch / 4 số cuối tài khoản<input value={reference} onChange={(event) => setReference(event.target.value)} required minLength={4} maxLength={40} placeholder="Ví dụ: 1234 hoặc FT24123456" /></label><label>Ghi chú (không bắt buộc)<input value={note} onChange={(event) => setNote(event.target.value)} maxLength={140} placeholder="Thông tin thêm cho quản trị viên" /></label><button className="primary-btn" type="submit">Gửi yêu cầu nạp <span>↗</span></button><p className={`deposit-message ${depositError ? "error" : ""}`} role="status">{depositMessage}</p></form><button className="deposit-back" type="button" onClick={() => setAmountReady(false)}>← Đổi số tiền</button></div></div><p className="deposit-safety">🔒 Không cung cấp mật khẩu, mã OTP hoặc mã bảo mật.</p></div>
            )}
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart-drawer open">
          <button className="drawer-overlay" type="button" aria-label="Đóng giỏ hàng" onClick={() => setCartOpen(false)} />
          <aside className="drawer-content cart-redesign">
            <div className="drawer-header"><div><span className="drawer-kicker">MMO CART · GIỎ CỦA BẠN</span><h3>Giỏ hàng <span>({cartItems.length})</span></h3></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Đóng giỏ hàng">×</button></div>
            {cartItems.length === 0 ? <div className="cart-empty"><div className="cart-empty-icon">⌑</div><strong>Giỏ hàng đang trống</strong><p>Thêm tài khoản, key hoặc dịch vụ MMO để thanh toán nhanh hơn.</p><a className="primary-btn" href="#market" onClick={(event) => { scrollToSection(event, "market"); setCartOpen(false); }}>Khám phá chợ MMO <span>↗</span></a></div> : <><div className="cart-status"><span className="status-dot"></span><span>Giao tự động · bảo vệ giao dịch</span><b>{cartItems.length} sản phẩm</b></div><div className="cart-items">{cartItems.map((product) => <article className="cart-item" key={product.name}><div className={"cart-thumb " + product.visual}>{product.emblem}</div><div className="cart-item-copy"><strong>{product.name}</strong><small>{product.seller} · Seller xác minh</small><b>{money(product.price)}</b></div><button className="cart-remove" type="button" onClick={() => removeFromCart(product.name)} aria-label={"Bỏ " + product.name + " khỏi giỏ"}>×</button></article>)}</div><div className="cart-total-row"><span>Tạm tính</span><strong>{money(cartTotal)}</strong></div><p className="cart-note">Thanh toán bằng số dư ví. Sản phẩm số được giao sau khi đơn hoàn tất.</p><button className="checkout-btn" type="button" onClick={() => { setCartOpen(false); openLogin(); }}>Tiến hành thanh toán <span>↗</span></button></>}
          </aside>
        </div>
      )}

      {loginOpen && <div className="modal open"><button className="modal-overlay" type="button" aria-label="Đóng cửa sổ" onClick={() => setLoginOpen(false)} /><div className="modal-card"><button className="modal-close" type="button" onClick={() => setLoginOpen(false)}>×</button><div className="modal-logo"><span className="brand-mark"><span></span><span></span><span></span></span></div><h3>Đăng nhập Kho Số Việt</h3><p>Đăng nhập để mua hàng, theo dõi ví và quản lý đơn.</p><form onSubmit={submitLogin}><label>Email hoặc tên tài khoản<input name="email" type="email" required placeholder="you@email.com" /></label><label>Mật khẩu<input name="password" type="password" required placeholder="••••••••" /></label>{authMessage && <p className={`auth-message ${authError ? "error" : ""}`} role="alert">{authMessage}</p>}<button className="primary-btn" type="submit">Đăng nhập <span>→</span></button></form><small>Chưa có tài khoản? <button className="modal-link" type="button" onClick={openRegister}>Đăng ký ngay</button></small></div></div>}
      {registerOpen && <div className="modal open"><button className="modal-overlay" type="button" aria-label="Đóng đăng ký" onClick={() => setRegisterOpen(false)} /><div className="modal-card"><button className="modal-close" type="button" onClick={() => setRegisterOpen(false)}>×</button><div className="modal-logo"><span className="brand-mark"><span></span><span></span><span></span></span></div><h3>Tạo tài khoản mới</h3><p>Đăng ký miễn phí để mua hàng, nạp ví và quản lý đơn.</p><form onSubmit={submitRegister}><label>Tên hiển thị<input name="displayName" type="text" required placeholder="Nguyễn Văn A" /></label><label>Email<input name="email" type="email" required placeholder="you@email.com" /></label><label>Mật khẩu<input name="password" type="password" required minLength={6} placeholder="Tối thiểu 6 ký tự" /></label>{authMessage && <p className={`auth-message ${authError ? "error" : ""}`} role="alert">{authMessage}</p>}<button className="primary-btn" type="submit">Đăng ký tài khoản <span>→</span></button></form><small>Đã có tài khoản? <button className="modal-link" type="button" onClick={openLogin}>Đăng nhập</button></small></div></div>}

      <section className="contact-strip"><div className="container contact-strip-inner"><div><span className="eyebrow muted">HỖ TRỢ KHÁCH HÀNG</span><strong>Cần hỗ trợ? Liên hệ với Kho Số Việt</strong></div><div className="contact-links"><a href="mailto:tngapro@gmail.com">✉ tngapro@gmail.com</a><a href="https://t.me/Ngoclan6738" target="_blank" rel="noreferrer">✈ Tele: Ngoclan6738</a></div></div></section>
      {toast && <div className="toast show" role="status">{toast}</div>}

      <footer id="support" className="footer"><div className="container footer-main"><div className="footer-brand"><a className="brand" href="#top" onClick={(event) => scrollToSection(event, "top")}><span className="brand-mark"><span></span><span></span><span></span></span><span className="brand-name">KHO SỐ <span>VIỆT</span></span></a><p>Nền tảng giao dịch sản phẩm số<br />rõ ràng và tiện lợi.</p><div className="socials"><a href="#support" onClick={(event) => scrollToSection(event, "support")}>𝕏</a><a href="#support" onClick={(event) => scrollToSection(event, "support")}>f</a><a href="#support" onClick={(event) => scrollToSection(event, "support")}>◎</a><a href="#support" onClick={(event) => scrollToSection(event, "support")}>▶</a></div></div><div className="footer-col"><h4>Khám phá</h4><a href="#market" onClick={(event) => scrollToSection(event, "market")}>Sản phẩm</a><a href="#categories" onClick={(event) => scrollToSection(event, "categories")}>Danh mục</a><button type="button" onClick={() => openDeposit()}>Nạp tiền</button><a href="#seller" onClick={(event) => scrollToSection(event, "seller")}>Bán hàng</a></div><div className="footer-col"><h4>Hỗ trợ</h4><a href="#support" onClick={(event) => scrollToSection(event, "support")}>Trung tâm hỗ trợ</a><button type="button" onClick={() => openDeposit()}>Hướng dẫn nạp tiền</button><a href="mailto:tngapro@gmail.com">tngapro@gmail.com</a><a href="https://t.me/Ngoclan6738" target="_blank" rel="noreferrer">Tele: Ngoclan6738</a></div><div className="footer-col newsletter"><h4>Thanh toán an toàn</h4><p>Chuyển khoản QR, đối soát thủ công và phản hồi rõ ràng.</p><span className="footer-contact">Hỗ trợ 24/7</span></div></div><div className="container footer-bottom"><span>© 2026 Kho Số Việt. Mọi quyền được bảo lưu.</span><div><a href="#support" onClick={(event) => scrollToSection(event, "support")}>Điều khoản</a><a href="#support" onClick={(event) => scrollToSection(event, "support")}>Bảo mật</a><a href="#top" onClick={(event) => scrollToSection(event, "top")}>Về đầu trang ↑</a></div></div></footer>
    </main>
  );
}
