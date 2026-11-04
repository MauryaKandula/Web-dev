import React, { useState, useEffect } from 'react';
import { User, Product, LibraryItem, Review } from './types.ts';
import { api, setAuthToken, getAuthToken } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { MarketplacePage } from './pages/MarketplacePage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { LibraryPage } from './pages/LibraryPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { CreatorDashboard } from './pages/CreatorDashboard.tsx';
import { AdminConsole } from './pages/AdminConsole.tsx';
import { PlacementForgePage } from './pages/PlacementForgePage.tsx';
import { PortfolioDeployPage } from './pages/PortfolioDeployPage.tsx';
import { ProjectLaunchPage } from './pages/ProjectLaunchPage.tsx';
import { RepoLensPage } from './pages/RepoLensPage.tsx';
import { InterviewLabPage } from './pages/InterviewLabPage.tsx';
import { StudySignalPage } from './pages/StudySignalPage.tsx';
import { CampusOpsPage } from './pages/CampusOpsPage.tsx';
import { CreatorPipePage } from './pages/CreatorPipePage.tsx';
import { WorkflowVaultPage } from './pages/WorkflowVaultPage.tsx';
import { FreelanceOSPage } from './pages/FreelanceOSPage.tsx';
import { PromptMatrixPage } from './pages/PromptMatrixPage.tsx';
import { SponsorPage } from './pages/SponsorPage.tsx';
import { AnimeClashPage } from './pages/AnimeClashPage.tsx';
import { IdleGamePage } from './pages/IdleGamePage.tsx';
import { ShellRicePage } from './pages/ShellRicePage.tsx';
import { ReaStudioPage } from './pages/ReaStudioPage.tsx';
import { DebloatStudioPage } from './pages/DebloatStudioPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { RefundPolicyPage } from './pages/RefundPolicyPage.tsx';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage.tsx';
import { LicensingPage } from './pages/LicensingPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { CyberHUD } from './components/CyberHUD.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { InteractiveTerminalModal } from './components/InteractiveTerminalModal.tsx';
import { sound } from './services/sound.ts';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const resolveTabFromLocation = (): string => {
  if (typeof window === 'undefined') return 'marketplace';
  const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (rawHash === 'fightkro' || rawHash === 'animeclash') return 'animeclash';
  if (rawHash === 'idlegame' || rawHash === 'idle' || rawHash === 'infiniteempire') return 'idlegame';
  if (rawHash === 'patreon' || rawHash === 'sponsor' || rawHash === 'sponsors') return 'sponsor';
  if (rawHash === 'promptmatrix' || rawHash === 'matrix') return 'promptmatrix';
  if (rawHash === 'shellrice' || rawHash === 'rice') return 'shellrice';
  if (rawHash === 'reastudio' || rawHash === 'rea') return 'reastudio';
  if (rawHash === 'debloatstudio' || rawHash === 'debloat') return 'debloatstudio';
  if (rawHash === 'terms' || rawHash === 'termsandconditions') return 'terms';
  if (rawHash === 'privacy' || rawHash === 'privacypolicy') return 'privacy';
  if (rawHash === 'refund' || rawHash === 'refunds' || rawHash === 'refund-policy') return 'refund';
  if (rawHash === 'shipping' || rawHash === 'shipping-policy' || rawHash === 'delivery') return 'shipping';
  if (rawHash === 'licensing' || rawHash === 'license') return 'licensing';
  if (rawHash === 'contact' || rawHash === 'contact-us' || rawHash === 'support') return 'contact';
  if (['placementforge', 'portfoliodeploy', 'projectlaunch', 'repolens', 'interviewlab', 'studysignal', 'campusops', 'creatorpipe', 'workflowvault', 'freelanceos', 'library', 'wishlist', 'creator', 'admin', 'shellrice', 'reastudio', 'debloatstudio', 'terms', 'privacy', 'refund', 'shipping', 'licensing', 'contact'].includes(rawHash)) {
    return rawHash;
  }
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab')?.toLowerCase();
  if (tabParam === 'fightkro' || tabParam === 'animeclash') return 'animeclash';
  if (tabParam === 'idlegame' || tabParam === 'idle') return 'idlegame';
  if (tabParam === 'patreon' || tabParam === 'sponsor') return 'sponsor';
  if (tabParam === 'promptmatrix') return 'promptmatrix';
  if (tabParam === 'shellrice' || tabParam === 'rice') return 'shellrice';
  if (tabParam === 'reastudio' || tabParam === 'rea') return 'reastudio';
  if (tabParam === 'debloatstudio' || tabParam === 'debloat') return 'debloatstudio';
  if (tabParam === 'terms') return 'terms';
  if (tabParam === 'privacy') return 'privacy';
  if (tabParam === 'refund' || tabParam === 'refund-policy') return 'refund';
  if (tabParam === 'shipping' || tabParam === 'shipping-policy') return 'shipping';
  if (tabParam === 'licensing' || tabParam === 'license') return 'licensing';
  if (tabParam === 'contact' || tabParam === 'support') return 'contact';
  if (tabParam && ['placementforge', 'portfoliodeploy', 'projectlaunch', 'repolens', 'interviewlab', 'studysignal', 'campusops', 'creatorpipe', 'workflowvault', 'freelanceos', 'library', 'wishlist', 'creator', 'admin', 'terms', 'privacy', 'refund', 'shipping', 'licensing', 'contact'].includes(tabParam)) {
    return tabParam;
  }
  return 'marketplace';
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTabState] = useState<string>(resolveTabFromLocation);
  const [products, setProducts] = useState<Product[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [terminalOpen, setTerminalOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  const setActiveTab = (tab: string) => {
    sound.playClick();
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'marketplace' ? '' : `#${tab}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTabState(resolveTabFromLocation());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Detail View State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductReviews, setSelectedProductReviews] = useState<Review[]>([]);

  // Checkout State
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initialize Session
  const initSession = async () => {
    try {
      setLoading(true);
      // Auto log in as default customer (MK) if no token
      let userRes: User | null = null;
      try {
        if (!getAuthToken()) {
          const switchRes = await api.demoSwitch('customer');
          setAuthToken(switchRes.token);
          userRes = switchRes.user;
        } else {
          try {
            const meRes = await api.getMe();
            userRes = meRes.user;
          } catch {
            const switchRes = await api.demoSwitch('customer');
            setAuthToken(switchRes.token);
            userRes = switchRes.user;
          }
        }
      } catch {
        userRes = {
          id: 'usr_customer',
          email: 'customer@toolforge.test',
          name: 'Demo Customer',
          role: 'customer',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mk'
        };
      }
      setCurrentUser(userRes);

      // Load products & user data
      await refreshAllData();
    } catch (err: any) {
      console.error('Session init error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      const [prodRes, libRes, wishRes] = await Promise.all([
        api.getProducts(),
        api.getLibrary().catch(() => ({ library: [] })),
        api.getWishlist().catch(() => ({ wishlist: [] }))
      ]);
      setProducts(prodRes.products || []);
      setLibrary(libRes.library || []);
      setWishlist(wishRes.wishlist || []);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  // Role Switcher
  const handleSwitchRole = async (role: 'customer' | 'creator' | 'admin') => {
    try {
      setLoading(true);
      const res = await api.demoSwitch(role);
      setAuthToken(res.token);
      setCurrentUser(res.user);
      await refreshAllData();
      showToast(`Switched active session to ${res.user.name} (${role})`);
      if (role === 'creator') setActiveTab('creator');
      else if (role === 'admin') setActiveTab('admin');
      else setActiveTab('marketplace');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch role', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Select Product for Details
  const handleSelectProduct = async (prod: Product) => {
    try {
      const res = await api.getProductBySlug(prod.slug || prod.id);
      setSelectedProduct(res.product);
      setSelectedProductReviews(res.reviews || []);
      setActiveTab('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Failed to load product details', 'error');
    }
  };

  // Toggle Wishlist
  const handleToggleWishlist = async (productId: string) => {
    try {
      const res = await api.toggleWishlist(productId);
      const wishRes = await api.getWishlist();
      setWishlist(wishRes.wishlist || []);
      showToast(res.inWishlist ? 'Saved to your wishlist' : 'Removed from wishlist');
    } catch (err: any) {
      showToast(err.message || 'Wishlist update failed', 'error');
    }
  };

  // Initiate Buy
  const handleBuy = (product: Product) => {
    setCheckoutProduct(product);
  };

  // Complete Checkout
  const handleCompleteCheckout = async (productId: string, paymentMethod: string) => {
    let res: any;
    if (paymentMethod === 'razorpay') {
      const order = await api.createRazorpayOrder(productId);
      if (typeof (window as any).Razorpay !== 'undefined') {
        res = await new Promise((resolve, reject) => {
          const rzp = new (window as any).Razorpay({
            key: order.keyId,
            amount: order.amountPaise,
            currency: order.currency,
            name: 'ToolForge Marketplace',
            description: order.productTitle,
            order_id: order.orderId,
            notes: order.notes,
            handler: async (paymentResp: any) => {
              try {
                const verified = await api.verifyRazorpayPayment(paymentResp);
                resolve(verified);
              } catch (err) {
                reject(err);
              }
            },
            theme: { color: '#3b82f6' }
          });
          rzp.on('payment.failed', (resp: any) => {
            reject(new Error(resp.error?.description || 'Razorpay checkout cancelled or failed'));
          });
          rzp.open();
        });
      } else {
        throw new Error('Razorpay Checkout did not load. Check your connection and try again.');
      }
    } else {
      res = await api.checkout(productId, paymentMethod);
    }
    await refreshAllData();
    showToast(`Order confirmed! License key: ${res.licenseKey}`);
    return res;
  };

  // Add Review
  const handleAddReview = async (productId: string, rating: number, comment: string) => {
    try {
      await api.addReview(productId, rating, comment);
      const refreshed = await api.getProductBySlug(selectedProduct?.slug || productId);
      setSelectedProduct(refreshed.product);
      setSelectedProductReviews(refreshed.reviews);
      showToast('Review posted successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to post review', 'error');
    }
  };

  // Secure File Download Trigger
  const handleDownload = (productId: string) => {
    const token = getAuthToken();
    const downloadUrl = `/api/orders/download/${productId}?token=${encodeURIComponent(token || '')}`;
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = '';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    showToast('Download initiated. The package integrity check passed.');
  };

  const handleLaunchApp = (productId: string) => {
    if (productId === 'prod_placementforge') {
      setActiveTab('placementforge');
    } else if (productId === 'prod_portfoliodeploy') {
      setActiveTab('portfoliodeploy');
    } else if (productId === 'prod_projectlaunch') {
      setActiveTab('projectlaunch');
    } else if (productId === 'prod_repolens') {
      setActiveTab('repolens');
    } else if (productId === 'prod_interviewlab') {
      setActiveTab('interviewlab');
    } else if (productId === 'prod_studysignal') {
      setActiveTab('studysignal');
    } else if (productId === 'prod_campusops') {
      setActiveTab('campusops');
    } else if (productId === 'prod_creatorpipe') {
      setActiveTab('creatorpipe');
    } else if (productId === 'prod_workflowvault') {
      setActiveTab('workflowvault');
    } else if (productId === 'prod_freelanceos') {
      setActiveTab('freelanceos');
    } else if (productId === 'prod_promptmatrix') {
      setActiveTab('promptmatrix');
    } else if (productId === 'prod_anime_clash') {
      setActiveTab('animeclash');
    } else if (productId === 'prod_infinite_empire') {
      setActiveTab('idlegame');
    } else if (productId.startsWith('tool_aes_') || productId === 'prod_shellrice') {
      setActiveTab('shellrice');
    } else if (productId.startsWith('tool_utl_') || productId === 'prod_debloat') {
      setActiveTab('debloatstudio');
    } else if (productId.startsWith('tool_dev_') || productId === 'prod_rea') {
      setActiveTab('reastudio');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ownedProductIds = new Set(library.map((item) => item.product_id));
  const wishlistProductIds = new Set(wishlist.map((item) => item.id));

  return (
    <div className={`min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black ${scanlinesEnabled ? 'cyber-scanlines' : ''} cyber-grid-bg`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        wishlistCount={wishlist.length}
        libraryCount={library.length}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading && !currentUser ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm font-medium">Loading ToolForge preview...</p>
          </div>
        ) : (
          <>
            {activeTab === 'marketplace' && (
              <MarketplacePage
                products={products}
                libraryIds={ownedProductIds}
                wishlistIds={wishlistProductIds}
                onBuy={handleBuy}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={handleSelectProduct}
                onLaunchApp={handleLaunchApp}
              />
            )}

            {activeTab === 'detail' && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                reviews={selectedProductReviews}
                isOwned={ownedProductIds.has(selectedProduct.id)}
                isWishlisted={wishlistProductIds.has(selectedProduct.id)}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                onToggleWishlist={handleToggleWishlist}
                onAddReview={handleAddReview}
                onDownload={handleDownload}
                onLaunchApp={handleLaunchApp}
              />
            )}

            {activeTab === 'library' && (
              <LibraryPage
                library={library}
                onDownload={handleDownload}
                onExplore={() => setActiveTab('marketplace')}
                onLaunchApp={handleLaunchApp}
              />
            )}

            {activeTab === 'placementforge' && (
              <PlacementForgePage
                isOwned={ownedProductIds.has('prod_placementforge')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_placementforge')}
              />
            )}

            {activeTab === 'portfoliodeploy' && (
              <PortfolioDeployPage
                isOwned={ownedProductIds.has('prod_portfoliodeploy')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_portfoliodeploy')}
              />
            )}

            {activeTab === 'projectlaunch' && (
              <ProjectLaunchPage
                isOwned={ownedProductIds.has('prod_projectlaunch')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_projectlaunch')}
              />
            )}

            {activeTab === 'repolens' && (
              <RepoLensPage
                isOwned={ownedProductIds.has('prod_repolens')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_repolens')}
              />
            )}

            {activeTab === 'interviewlab' && (
              <InterviewLabPage
                isOwned={ownedProductIds.has('prod_interviewlab')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_interviewlab')}
              />
            )}

            {activeTab === 'studysignal' && (
              <StudySignalPage
                isOwned={ownedProductIds.has('prod_studysignal')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_studysignal')}
              />
            )}

            {activeTab === 'campusops' && (
              <CampusOpsPage
                isOwned={ownedProductIds.has('prod_campusops')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_campusops')}
              />
            )}

            {activeTab === 'creatorpipe' && (
              <CreatorPipePage
                isOwned={ownedProductIds.has('prod_creatorpipe')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_creatorpipe')}
              />
            )}

            {activeTab === 'workflowvault' && (
              <WorkflowVaultPage
                isOwned={ownedProductIds.has('prod_workflowvault')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_workflowvault')}
              />
            )}

            {activeTab === 'freelanceos' && (
              <FreelanceOSPage
                isOwned={ownedProductIds.has('prod_freelanceos')}
                onBack={() => setActiveTab('marketplace')}
                onBuy={handleBuy}
                product={products.find(p => p.id === 'prod_freelanceos')}
              />
            )}

            {activeTab === 'promptmatrix' && (
              <PromptMatrixPage />
            )}

            {activeTab === 'sponsor' && (
              <SponsorPage />
            )}

            {activeTab === 'animeclash' && (
              <AnimeClashPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'idlegame' && (
              <IdleGamePage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'shellrice' && (
              <ShellRicePage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'reastudio' && (
              <ReaStudioPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'debloatstudio' && (
              <DebloatStudioPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'wishlist' && (
              <WishlistPage
                wishlist={wishlist}
                ownedProductIds={ownedProductIds}
                onBuy={handleBuy}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={handleSelectProduct}
                onExplore={() => setActiveTab('marketplace')}
              />
            )}

            {activeTab === 'creator' && <CreatorDashboard />}

            {activeTab === 'admin' && <AdminConsole />}

            {/* Payment Gateway & Legal Compliance Pages */}
            {activeTab === 'terms' && (
              <TermsPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'privacy' && (
              <PrivacyPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'refund' && (
              <RefundPolicyPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'shipping' && (
              <ShippingPolicyPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'licensing' && (
              <LicensingPage onBack={() => setActiveTab('marketplace')} />
            )}

            {activeTab === 'contact' && (
              <ContactPage onBack={() => setActiveTab('marketplace')} />
            )}
          </>
        )}
      </main>

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onComplete={handleCompleteCheckout}
        />
      )}

      {/* Cyberpunk HUD Telemetry Bar */}
      <CyberHUD
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
        onOpenTerminal={() => setTerminalOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        products={products}
        onSelectTab={setActiveTab}
        onSelectProduct={handleSelectProduct}
        onSwitchRole={handleSwitchRole}
        onOpenTerminal={() => setTerminalOpen(true)}
      />

      {/* Interactive Cyber Terminal Sandbox */}
      <InteractiveTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        products={products}
      />

      {/* Marketplace details and payment disclosures */}
      <footer className="mt-auto border-t border-slate-800 bg-[#04060d] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand & Entity */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-white tracking-wider">TOOLFORGE</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  v2.6 CYBER
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                A marketplace prototype for independent developers to share software, templates, and practical tools.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <p>Merchant identity and support details will be published after business verification.</p>
                <p><strong className="text-slate-400">Checkout:</strong> Razorpay, when merchant keys are configured</p>
              </div>
            </div>

            {/* Column 2: Legal & Merchant Policies */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 border-l-2 border-cyan-500 pl-2">
                Legal & Merchant Policies
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setActiveTab('terms')}
                    className="hover:text-cyan-400 transition flex items-center space-x-1.5"
                  >
                    <span>Terms & Conditions</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className="hover:text-cyan-400 transition flex items-center space-x-1.5"
                  >
                    <span>Privacy Policy (DPDP Act 2023)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('refund')}
                    className="hover:text-cyan-400 transition flex items-center space-x-1.5"
                  >
                    <span className="text-emerald-400 font-semibold">Refund policy draft</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className="hover:text-cyan-400 transition flex items-center space-x-1.5"
                  >
                    <span>Digital delivery notes</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('licensing')}
                    className="hover:text-cyan-400 transition flex items-center space-x-1.5"
                  >
                    <span>Licensing & Commercial Use</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Tools & Source */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 border-l-2 border-blue-500 pl-2">
                Developer Ecosystem
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://github.com/MauryaKandula/Web-dev/tree/main/ToolForge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition flex items-center space-x-1"
                  >
                    <span>ToolForge source on GitHub ↗</span>
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setTerminalOpen(true)}
                    className="hover:text-blue-400 transition flex items-center space-x-1"
                  >
                    <span>Cyberpunk Interactive Terminal</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('shellrice')}
                    className="hover:text-blue-400 transition flex items-center space-x-1"
                  >
                    <span>ShellRice Terminal Rice Customizer</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('debloatstudio')}
                    className="hover:text-blue-400 transition flex items-center space-x-1"
                  >
                    <span>Debloat Studio PowerShell Engine</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('animeclash')}
                    className="hover:text-blue-400 transition flex items-center space-x-1"
                  >
                    <span>FightKro // Anime Clash Arena</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('idlegame')}
                    className="hover:text-blue-400 transition flex items-center space-x-1"
                  >
                    <span>Infinite Empire (Sci-Fi Clicker)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact status */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 border-l-2 border-emerald-500 pl-2">
                Project contact
              </h4>
              <div className="space-y-2 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Support contact details will be published before live sales begin.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
                  >
                    View contact draft →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current payment status */}
          <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-3">
              <span>No live payments or recurring memberships are enabled</span>
              <span>•</span>
              <span>Creator payouts are not configured</span>
            </div>
            <div>
              © 2026 ToolForge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
