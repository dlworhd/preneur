import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit2,
    Trash2,
    Eye,
    Star,
    Calendar,
    DollarSign,
    TrendingUp,
    Package,
    Users,
} from "lucide-react";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

// 프로덕트 타입 정의
interface Product {
    id: string;
    name: string;
    description: string;
    status: "active" | "draft" | "archived";
    category: string;
    price: number;
    revenue: number;
    users: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    image?: string;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([
        {
            id: "1",
            name: "TaskFlow Pro",
            description: "고급 작업 관리 및 협업 도구",
            status: "active",
            category: "Productivity",
            price: 29.99,
            revenue: 12500,
            users: 1250,
            rating: 4.8,
            createdAt: new Date(2024, 0, 15),
            updatedAt: new Date(2024, 11, 20),
        },
        {
            id: "2",
            name: "Analytics Dashboard",
            description: "실시간 데이터 분석 및 시각화 플랫폼",
            status: "active",
            category: "Analytics",
            price: 49.99,
            revenue: 8900,
            users: 890,
            rating: 4.6,
            createdAt: new Date(2024, 2, 10),
            updatedAt: new Date(2024, 11, 18),
        },
        {
            id: "3",
            name: "Design System Kit",
            description: "통합 디자인 시스템 및 컴포넌트 라이브러리",
            status: "draft",
            category: "Design",
            price: 19.99,
            revenue: 0,
            users: 0,
            rating: 0,
            createdAt: new Date(2024, 10, 5),
            updatedAt: new Date(2024, 11, 15),
        },
    ]);

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isCreating, setIsCreating] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        category: "Productivity",
        price: 0,
    });

    const categories = ["all", "Productivity", "Analytics", "Design", "Marketing"];

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStatusColor = (status: Product["status"]) => {
        switch (status) {
            case "active":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "draft":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "archived":
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const handleCreateProduct = () => {
        if (!newProduct.name.trim()) return;

        const product: Product = {
            id: Date.now().toString(),
            name: newProduct.name,
            description: newProduct.description,
            status: "draft",
            category: newProduct.category,
            price: newProduct.price,
            revenue: 0,
            users: 0,
            rating: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setProducts([...products, product]);
        setIsCreating(false);
        setNewProduct({
            name: "",
            description: "",
            category: "Productivity",
            price: 0,
        });
    };

    const handleDeleteProduct = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div className="flex flex-col h-full">
            {/* 헤더 */}
            <div className="bg-[var(--background)] border-b border-[var(--container-border)] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[var(--secondary)] mb-1">
                            Products
                        </h1>
                        <p className="text-sm text-[var(--secondary)]/70">
                            프로덕트를 관리하고 성과를 추적하세요
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        새 프로덕트
                    </Button>
                </div>

                {/* 검색 및 필터 */}
                <div className="flex items-center gap-4 mt-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--secondary)]/50" />
                        <input
                            type="text"
                            placeholder="프로덕트 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-sm text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                        />
                    </div>
                    
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-sm text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category === "all" ? "모든 카테고리" : category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 프로덕트 그리드 */}
            <div className="bg-[var(--background)] flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-[var(--background)] border border-[var(--container-border)] rounded-xl p-6 hover:border-[var(--primary)]/30 hover:shadow-lg transition-all duration-200 group"
                        >
                            {/* 프로덕트 헤더 */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="w-5 h-5 text-[var(--primary)]" />
                                        <h3 className="font-semibold text-[var(--secondary)] truncate">
                                            {product.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-[var(--secondary)]/70 line-clamp-2 mb-3">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium border",
                                            getStatusColor(product.status)
                                        )}>
                                            {product.status}
                                        </span>
                                        <span className="text-xs text-[var(--secondary)]/50">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button className="p-1 hover:bg-[var(--container-border)]/50 rounded">
                                        <MoreHorizontal className="w-4 h-4 text-[var(--secondary)]/50" />
                                    </Button>
                                </div>
                            </div>

                            {/* 메트릭스 */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <DollarSign className="w-3 h-3 text-green-400" />
                                        <span className="text-xs text-[var(--secondary)]/60">수익</span>
                                    </div>
                                    <div className="text-sm font-semibold text-[var(--secondary)]">
                                        ${product.revenue.toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="w-3 h-3 text-blue-400" />
                                        <span className="text-xs text-[var(--secondary)]/60">사용자</span>
                                    </div>
                                    <div className="text-sm font-semibold text-[var(--secondary)]">
                                        {product.users.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* 평점 및 가격 */}
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--container-border)]/50">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium text-[var(--secondary)]">
                                        {product.rating > 0 ? product.rating.toFixed(1) : "N/A"}
                                    </span>
                                </div>
                                <div className="text-lg font-bold text-[var(--primary)]">
                                    ${product.price}
                                </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button className="flex-1 px-3 py-2 text-xs bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors">
                                    <Eye className="w-3 h-3 inline mr-1" />
                                    보기
                                </Button>
                                <Button className="px-3 py-2 text-xs border border-[var(--container-border)] rounded-lg hover:bg-[var(--container-border)]/20 transition-colors">
                                    <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="px-3 py-2 text-xs border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-[var(--secondary)]/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--secondary)] mb-2">
                            프로덕트가 없습니다
                        </h3>
                        <p className="text-[var(--secondary)]/60 mb-4">
                            첫 번째 프로덕트를 만들어보세요
                        </p>
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--primary)]/90"
                        >
                            프로덕트 만들기
                        </Button>
                    </div>
                )}
            </div>

            {/* 프로덕트 생성 모달 */}
            {isCreating && (
                <Modal
                    isOpen={isCreating}
                    onClose={() => {
                        setIsCreating(false);
                        setNewProduct({
                            name: "",
                            description: "",
                            category: "Productivity",
                            price: 0,
                        });
                    }}
                >
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-[var(--secondary)] mb-6">
                            새 프로덕트 만들기
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                                    프로덕트 이름
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                    placeholder="프로덕트 이름을 입력하세요"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                                    설명
                                </label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 h-24 resize-none"
                                    placeholder="프로덕트 설명을 입력하세요"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                                        카테고리
                                    </label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                    >
                                        {categories.filter(c => c !== "all").map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                                        가격 ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => {
                                    setIsCreating(false);
                                    setNewProduct({
                                        name: "",
                                        description: "",
                                        category: "Productivity",
                                        price: 0,
                                    });
                                }}
                                className="flex-1 px-4 py-2 border border-[var(--container-border)] text-[var(--secondary)] rounded-lg hover:bg-[var(--container-border)]/20 transition-colors"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleCreateProduct}
                                disabled={!newProduct.name.trim()}
                                className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                생성
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
} 