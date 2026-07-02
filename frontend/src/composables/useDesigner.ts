import { ref, computed } from 'vue';
import { Sparkles, TrendingUp, Package } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

// ============================================================================
// STATE DEFINITIONS (SINGLETON STORE - INSTANTIATED AT MODULE LEVEL)
// ============================================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const activeTab = ref<'designer' | 'catalog' | 'admin'>('designer');
const isDarkMode = ref<boolean>(true);

const updateThemeClass = () => {
  if (typeof document !== 'undefined') {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  updateThemeClass();
  saveToLocalStorage();
};

// Catalog state
const products = ref<any[]>([]);
const catalogLoading = ref(false);
const selectedCategory = ref<string>('Todos');
const selectedStyle = ref<string>('Todos');

// Workspace image upload state
const uploadDragOver = ref(false);
const uploadedImage = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isUploadingImage = ref(false);

// Design line timeline history
const designHistory = ref<any[]>([]);
const activeDesignId = ref<string>('');

const activeDesign = computed(() => {
  return designHistory.value.find(d => d.id === activeDesignId.value) || null;
});

// Comparison Slider state
const showComparison = ref(false);
const comparisonMode = ref<'original' | 'previous'>('original');
const sliderPosition = ref(50);
const isDraggingSlider = ref(false);

const beforeImageUrl = computed(() => {
  if (!activeDesign.value) return '';
  if (comparisonMode.value === 'original') {
    return designHistory.value[0]?.imageUrl || uploadedImage.value || '';
  } else {
    const idx = designHistory.value.findIndex(d => d.id === activeDesignId.value);
    if (idx > 0) {
      return designHistory.value[idx - 1].imageUrl;
    }
    return activeDesign.value.imageUrl;
  }
});

// Timeline Renaming state
const editingStageId = ref<string | null>(null);
const editingStageLabel = ref('');

// Quote Invoice state
const showQuoteModal = ref(false);
const preferences = ref({
  spaceType: 'Sala',
  style: 'Minimalista',
  colors: 'Tonos neutros y cálidos (Beige, Gris suave, Madera)',
  lighting: 'Luz natural abundante con lámparas cálidas de acento',
  customText: '',
  priority: 'speed'
});
const selectedProductIds = ref<string[]>([]);

// Designer AI progress logs
const isGenerating = ref(false);
const generationStep = ref(0);
const generationLogs = [
  "Analizando volumetría del espacio y catálogo con Gemini 2.5 Flash...",
  "Mapeando solicitudes semánticas y resolviendo elementos de catálogo...",
  "Descargando imágenes de referencia física de los muebles seleccionados...",
  "Renderizando habitación con fotorrealismo por referencias en Cloudflare Workers AI...",
  "Ajustando perspectivas, sombreado tridimensional e iluminación final..."
];

// Admin Credentials & stats state
const isAdminLoggedIn = ref(false);
const adminCredentials = ref({ username: '', password: '' });
const loginError = ref('');
const showAddModal = ref(false);
const editingProduct = ref<any | null>(null);
const adminFileInput = ref<HTMLInputElement | null>(null);
const productForm = ref({
  name: '',
  category: 'Sala',
  style: 'Minimalista',
  price: 0,
  dimensions: '',
  description: '',
  image: ''
});

const realStats = ref({
  totalGenerations: 0,
  totalQuotes: 0,
  styleStats: {} as Record<string, number>,
  totalProducts: 0
});

// Product detail preview state
const selectedProductForPreview = ref<any | null>(null);
const expandedProductImageUrl = ref<string | null>(null);

const highResExpandedImageUrl = computed(() => {
  if (!expandedProductImageUrl.value) return '';
  return expandedProductImageUrl.value.replace(/w=\d+/, 'w=1200');
});

// Gallery iterations Lightbox state
const isGalleryOpen = ref(false);
const galleryActiveDesignId = ref<string>('');

const galleryActiveIndex = computed(() => {
  return designHistory.value.findIndex(d => d.id === galleryActiveDesignId.value);
});

const galleryActiveDesign = computed(() => {
  return designHistory.value[galleryActiveIndex.value] || null;
});

// ============================================================================
// CORE LOGICAL METHODS
// ============================================================================

const fetchCatalog = async () => {
  catalogLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/catalog`);
    if (res.ok) {
      products.value = await res.json();
    }
  } catch (err) {
    console.error("Error al conectar con la API de Elysia:", err);
  } finally {
    catalogLoading.value = false;
  }
};

const saveToLocalStorage = () => {
  localStorage.setItem('mh_design_history', JSON.stringify(designHistory.value));
  localStorage.setItem('mh_active_design_id', activeDesignId.value);
  localStorage.setItem('mh_uploaded_image', uploadedImage.value || '');
  localStorage.setItem('mh_is_dark_mode', isDarkMode.value.toString());
};

const loadFromLocalStorage = () => {
  try {
    const history = localStorage.getItem('mh_design_history');
    const activeId = localStorage.getItem('mh_active_design_id');
    const uploadedImg = localStorage.getItem('mh_uploaded_image');
    const savedDark = localStorage.getItem('mh_is_dark_mode');
    
    if (savedDark !== null) {
      isDarkMode.value = savedDark === 'true';
    }
    updateThemeClass();
    
    if (history) {
      const parsed = JSON.parse(history);
      designHistory.value = parsed.map((item: any) => ({
        ...item,
        imageUrl: item.imageUrl.startsWith('/') ? `${API_URL}${item.imageUrl}` : item.imageUrl
      }));
    }
    if (activeId) {
      activeDesignId.value = activeId;
    }
    if (uploadedImg) {
      uploadedImage.value = uploadedImg.startsWith('/') ? `${API_URL}${uploadedImg}` : uploadedImg;
    }
  } catch (e) {
    console.error("Error al cargar de localStorage:", e);
  }
};

// Comparison slider controller
const startDrag = (e: MouseEvent | TouchEvent) => {
  isDraggingSlider.value = true;
  onDrag(e);
};

const stopDrag = () => {
  isDraggingSlider.value = false;
};

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDraggingSlider.value) return;
  const container = document.querySelector('.comparison-slider-container');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const x = clientX - rect.left;
  let percentage = (x / rect.width) * 100;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  sliderPosition.value = percentage;
};

// Timeline Renaming
const startRenameStage = (stage: any) => {
  editingStageId.value = stage.id;
  editingStageLabel.value = stage.label;
};

const saveStageLabel = (stage: any) => {
  if (editingStageLabel.value.trim()) {
    stage.label = editingStageLabel.value.trim();
  }
  editingStageId.value = null;
  saveToLocalStorage();
};

// Quote Invoice controller
const confirmQuote = async () => {
  try {
    const res = await fetch(`${API_URL}/api/stats/quote`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      realStats.value.totalQuotes = data.totalQuotes;
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
      });
      
      alert("✨ ¡Cotización Enviada! Un asesor de More House S.A. se pondrá en contacto contigo a la brevedad.");
      showQuoteModal.value = false;
    }
  } catch (err) {
    console.error(err);
    alert("Error al enviar la solicitud.");
  }
};

const printQuote = () => {
  const lastDesign = designHistory.value[designHistory.value.length - 1];
  const code = lastDesign ? lastDesign.id.replace('design-', '') : Date.now().toString().substring(7);
  
  const originalTitle = document.title;
  document.title = `MHDecorIA-Cotizacion-${code}`;
  
  window.print();
  
  setTimeout(() => {
    document.title = originalTitle;
  }, 100);
};

const getAccumulatedProducts = (stageId: string) => {
  const accumulated: any[] = [];
  const idx = designHistory.value.findIndex(d => d.id === stageId);
  if (idx === -1) return [];
  for (let i = 1; i <= idx; i++) {
    const stage = designHistory.value[i];
    if (stage && stage.products) {
      for (const prod of stage.products) {
        if (!accumulated.some(p => p.id === prod.id)) {
          accumulated.push(prod);
        }
      }
    }
  }
  return accumulated;
};

// Product catalog selection
const toggleProductSelection = (id: string) => {
  const idx = selectedProductIds.value.indexOf(id);
  if (idx > -1) {
    selectedProductIds.value.splice(idx, 1);
  } else {
    if (selectedProductIds.value.length >= 3) {
      alert("⚠️ Límite alcanzado: Puedes seleccionar hasta 3 productos por turno para garantizar fotorrealismo real de catálogo. ¡Puedes ir amueblando por etapas!");
      return;
    }
    selectedProductIds.value.push(id);
  }
};

const isProductAlreadyPlaced = (productId: string) => {
  if (!activeDesign.value) return false;
  return activeDesign.value.products.some((p: any) => p.id === productId);
};

// IA generation
const generateDesign = async () => {
  const active = activeDesign.value;
  if (!active) return;

  isGenerating.value = true;
  generationStep.value = 0;

  const stepInterval = setInterval(() => {
    if (generationStep.value < generationLogs.length - 1) {
      generationStep.value++;
    }
  }, 2500);

  try {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: active.imageUrl,
        preferences: preferences.value,
        selectedProductIds: selectedProductIds.value,
        qualityMode: preferences.value.priority
      })
    });

    if (res.ok) {
      const response = await res.json();
      clearInterval(stepInterval);
      
      const prevProducts = active.products || [];
      const mergedProducts = [...prevProducts];
      for (const p of response.selected_products) {
        if (!mergedProducts.some(m => m.id === p.id)) {
          mergedProducts.push(p);
        }
      }

      const newId = `design-${Date.now()}`;
      const finalImg = response.generated_image.startsWith('/') ? `${API_URL}${response.generated_image}` : response.generated_image;
      designHistory.value.push({
        id: newId,
        imageUrl: finalImg,
        products: mergedProducts,
        label: `Diseño ${designHistory.value.length} (${response.selected_products.map((p: any) => p.name).join(', ') || 'IA Sugerido'})`,
        currentIssues: response.current_issues,
        prompt: response.prompt
      });
      
      activeDesignId.value = newId;
      selectedProductIds.value = [];
      saveToLocalStorage();

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#3b82f6']
      });
    } else {
      const errText = await res.text();
      alert(`Hubo un problema al generar la propuesta: ${errText}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el backend.");
  } finally {
    clearInterval(stepInterval);
    isGenerating.value = false;
  }
};

// Downloads
const downloadDesign = () => {
  if (!activeDesign.value) return;
  const imageUrl = activeDesign.value.imageUrl;
  const isDataUrl = imageUrl.startsWith('data:');
  const downloadUrl = isDataUrl ? imageUrl : `${API_URL}/api/proxy?url=${encodeURIComponent(imageUrl)}`;
  downloadImage(downloadUrl, `rediseno-more-house-etapa-${designHistory.value.indexOf(activeDesign.value)}.png`);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    processFile(files[0]);
  }
};

const handleDrop = (e: DragEvent) => {
  uploadDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files[0]) {
    processFile(files[0]);
  }
};

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('Por favor carga únicamente archivos de imagen.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('La imagen supera el límite de 10MB.');
    return;
  }

  isUploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log("Subiendo imagen de habitación a R2...");
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      const fullUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
      
      uploadedImage.value = fullUrl;
      designHistory.value = [
        { id: 'original', imageUrl: fullUrl, products: [], label: 'Habitación Original' }
      ];
      activeDesignId.value = 'original';
      selectedProductIds.value = [];
      saveToLocalStorage();
      console.log("Subida exitosa de habitación a R2:", fullUrl);
    } else {
      const errMsg = await res.text();
      alert(`Error al subir la imagen al almacenamiento R2: ${errMsg}`);
    }
  } catch (err: any) {
    console.error("Error al subir a R2:", err);
    alert('Error de conexión al subir la imagen al almacenamiento R2.');
  } finally {
    isUploadingImage.value = false;
  }
};

const clearUploadedImage = () => {
  if (confirm("¿Estás seguro de que deseas reiniciar y borrar todo tu historial de diseño actual?")) {
    uploadedImage.value = null;
    designHistory.value = [];
    activeDesignId.value = '';
    selectedProductIds.value = [];
    localStorage.removeItem('mh_design_history');
    localStorage.removeItem('mh_active_design_id');
    localStorage.removeItem('mh_uploaded_image');
  }
};

const downloadImage = async (imgUrl: string, filename: string) => {
  try {
    const res = await fetch(imgUrl);
    const blob = await res.blob();
    const localUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libera la URL del objeto después de un breve delay
    setTimeout(() => {
      URL.revokeObjectURL(localUrl);
    }, 150);
  } catch (err) {
    console.error("Fallo al descargar la imagen mediante Blob, usando fallback directo:", err);
    const link = document.createElement('a');
    link.href = imgUrl;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Admin CRUD operations
const triggerAdminFileInput = () => {
  adminFileInput.value?.click();
};

const handleAdminFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen supera el límite de 5MB.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        const fullUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
        productForm.value.image = fullUrl;
        alert("✨ Imagen del producto subida a R2 con éxito.");
      } else {
        const errMsg = await res.text();
        alert(`Error al subir imagen a R2: ${errMsg}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con la API de subida.");
    }
  }
};

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const catMatch = selectedCategory.value === 'Todos' || p.category === selectedCategory.value;
    const styleMatch = selectedStyle.value === 'Todos' || p.style === selectedStyle.value;
    return catMatch && styleMatch;
  });
});

const handleAdminLogin = async () => {
  loginError.value = '';
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminCredentials.value)
    });
    const data = await res.json();
    if (data.success) {
      isAdminLoggedIn.value = true;
    } else {
      loginError.value = data.message || 'Credenciales incorrectas.';
    }
  } catch (err) {
    loginError.value = 'Error al conectar con la API de autenticación.';
  }
};

const handleAdminLogout = () => {
  isAdminLoggedIn.value = false;
  adminCredentials.value = { username: '', password: '' };
};

const saveProduct = async () => {
  try {
    const url = editingProduct.value 
      ? `${API_URL}/api/catalog/${editingProduct.value.id}` 
      : `${API_URL}/api/catalog`;
    const method = editingProduct.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm.value)
    });

    if (res.ok) {
      await fetchCatalog();
      showAddModal.value = false;
      editingProduct.value = null;
      resetProductForm();
    }
  } catch (err) {
    console.error(err);
  }
};

const editProduct = (product: any) => {
  editingProduct.value = product;
  productForm.value = { ...product };
  showAddModal.value = true;
};

const deleteProduct = async (id: string) => {
  if (!confirm("¿Estás seguro de eliminar este producto del catálogo?")) return;
  try {
    const res = await fetch(`${API_URL}/api/catalog/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await fetchCatalog();
    }
  } catch (err) {
    console.error(err);
  }
};

const resetProductForm = () => {
  productForm.value = {
    name: '',
    category: 'Sala',
    style: 'Minimalista',
    price: 0,
    dimensions: '',
    description: '',
    image: ''
  };
};

const openAddModal = () => {
  editingProduct.value = null;
  resetProductForm();
  showAddModal.value = true;
};

const fetchStats = async () => {
  try {
    const res = await fetch(`${API_URL}/api/stats`);
    if (res.ok) {
      realStats.value = await res.json();
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
};

const quoteProduct = async (product: any) => {
  try {
    const res = await fetch(`${API_URL}/api/stats/quote`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      realStats.value.totalQuotes = data.totalQuotes;
      alert(`✨ ¡Cotización Solicitada! Hemos enviado tu solicitud para: "${product.name}". (Métrica real registrada en el servidor)`);
    }
  } catch (err) {
    console.error(err);
  }
};

const quoteAllProducts = () => {
  if (!activeDesign.value || activeDesign.value.products.length === 0) return;
  showQuoteModal.value = true;
};

const stats = computed(() => {
  return [
    { name: "Procesamientos Reales IA", value: realStats.value.totalGenerations.toString(), icon: Sparkles, color: "text-indigo-400" },
    { name: "Cotizaciones / Leads", value: realStats.value.totalQuotes.toString(), icon: TrendingUp, color: "text-emerald-400" },
    { name: "Productos en Catálogo", value: products.value.length.toString(), icon: Package, color: "text-amber-400" }
  ];
});

const openProductPreview = (product: any) => {
  selectedProductForPreview.value = product;
};

const closeProductPreview = () => {
  selectedProductForPreview.value = null;
};

// Gallery iterations lightbox methods
const openGallery = (designId: string) => {
  galleryActiveDesignId.value = designId || activeDesignId.value || 'original';
  isGalleryOpen.value = true;
};

const closeGallery = () => {
  isGalleryOpen.value = false;
};

const selectGalleryDesign = (id: string) => {
  galleryActiveDesignId.value = id;
  activeDesignId.value = id;
};

const galleryPrev = () => {
  const prevIdx = galleryActiveIndex.value - 1;
  if (prevIdx >= 0) {
    const id = designHistory.value[prevIdx].id;
    galleryActiveDesignId.value = id;
    activeDesignId.value = id;
  }
};

const galleryNext = () => {
  const nextIdx = galleryActiveIndex.value + 1;
  if (nextIdx < designHistory.value.length) {
    const id = designHistory.value[nextIdx].id;
    galleryActiveDesignId.value = id;
    activeDesignId.value = id;
  }
};

const downloadGalleryDesign = () => {
  const design = galleryActiveDesign.value;
  if (!design) return;
  const imageUrl = design.imageUrl;
  const isDataUrl = imageUrl.startsWith('data:');
  const downloadUrl = isDataUrl ? imageUrl : `${API_URL}/api/proxy?url=${encodeURIComponent(imageUrl)}`;
  downloadImage(downloadUrl, `rediseno-more-house-etapa-${designHistory.value.indexOf(design)}.png`);
};

// Initialize listeners and loading
let isInitialized = false;

const init = () => {
  if (isInitialized) return;
  isInitialized = true;
  
  fetchCatalog();
  fetchStats();
  loadFromLocalStorage();

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag);
};

const destroy = () => {
  isInitialized = false;
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchend', stopDrag);
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('touchmove', onDrag);
};

// ============================================================================
// SINGLE COMPOSABLE EXPORT
// ============================================================================
export function useDesigner() {
  return {
    API_URL,
    activeTab,
    products,
    catalogLoading,
    selectedCategory,
    selectedStyle,
    uploadDragOver,
    uploadedImage,
    fileInput,
    isUploadingImage,
    designHistory,
    activeDesignId,
    activeDesign,
    showComparison,
    comparisonMode,
    sliderPosition,
    isDraggingSlider,
    beforeImageUrl,
    editingStageId,
    editingStageLabel,
    showQuoteModal,
    preferences,
    selectedProductIds,
    isGenerating,
    generationStep,
    generationLogs,
    isAdminLoggedIn,
    adminCredentials,
    loginError,
    showAddModal,
    editingProduct,
    adminFileInput,
    productForm,
    realStats,
    selectedProductForPreview,
    expandedProductImageUrl,
    highResExpandedImageUrl,
    isGalleryOpen,
    galleryActiveDesignId,
    galleryActiveIndex,
    galleryActiveDesign,
    isDarkMode,
    
    // Core methods
    toggleTheme,
    fetchCatalog,
    saveToLocalStorage,
    loadFromLocalStorage,
    startDrag,
    stopDrag,
    onDrag,
    startRenameStage,
    saveStageLabel,
    confirmQuote,
    printQuote,
    getAccumulatedProducts,
    toggleProductSelection,
    isProductAlreadyPlaced,
    generateDesign,
    downloadDesign,
    triggerFileInput,
    handleFileChange,
    handleDrop,
    processFile,
    clearUploadedImage,
    downloadImage,
    triggerAdminFileInput,
    handleAdminFileChange,
    filteredProducts,
    handleAdminLogin,
    handleAdminLogout,
    saveProduct,
    editProduct,
    deleteProduct,
    resetProductForm,
    openAddModal,
    fetchStats,
    quoteProduct,
    quoteAllProducts,
    stats,
    openProductPreview,
    closeProductPreview,
    openGallery,
    closeGallery,
    selectGalleryDesign,
    galleryPrev,
    galleryNext,
    downloadGalleryDesign,
    
    // Setup and cleanup lifecycle links
    init,
    destroy
  };
}
