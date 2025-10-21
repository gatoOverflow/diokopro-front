"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, RefreshCw, CreditCard, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';

const TransactionView = ({ transactions = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const ITEMS_PER_PAGE = 10;

    // Filtrage des transactions
    useEffect(() => {
        if (transactions && transactions.length > 0) {
            let filtered = transactions;
            
            // Filtrer par type
            if (selectedType !== 'all') {
                filtered = filtered.filter(t => t.type === selectedType);
            }
            
            // Filtrer par recherche
            if (searchTerm.trim() !== '') {
                const normalizedSearchTerm = searchTerm.toLowerCase().trim();
                filtered = filtered.filter(t =>
                    t.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    t.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    t.reference?.toLowerCase().includes(normalizedSearchTerm) ||
                    t.type?.toLowerCase().includes(normalizedSearchTerm) ||
                    t.wallet?.toLowerCase().includes(normalizedSearchTerm)
                );
            }
            
            setFilteredTransactions(filtered);
            setCurrentPage(1);
        } else {
            setFilteredTransactions([]);
        }
    }, [searchTerm, transactions, selectedType]);

    // Calculs de pagination
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Fonction pour obtenir l'icône selon le type
    const getTypeIcon = (type) => {
        switch(type) {
            case 'crédit':
            case 'credit':
                return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
            case 'débit':
                return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
            case 'virement de salaire':
                return <Wallet className="h-5 w-5 text-blue-500" />;
            case 'paiement client':
                return <CreditCard className="h-5 w-5 text-purple-500" />;
            case 'recharge de compte':
                return <RefreshCw className="h-5 w-5 text-orange-500" />;
            default:
                return <CreditCard className="h-5 w-5 text-gray-500" />;
        }
    };

    // Fonction pour obtenir le badge de type
    const getTypeBadge = (type) => {
        const badges = {
            'crédit': 'bg-green-100 text-green-800',
            'credit': 'bg-green-100 text-green-800',
            'débit': 'bg-red-100 text-red-800',
            'virement de salaire': 'bg-blue-100 text-blue-800',
            'paiement client': 'bg-purple-100 text-purple-800',
            'recharge de compte': 'bg-orange-100 text-orange-800'
        };
        
        return badges[type] || 'bg-gray-100 text-gray-800';
    };

    // Fonction pour obtenir le badge de statut
    const getStatusBadge = (statut) => {
        const status = statut?.toLowerCase() || '';
        
        if (status.includes('réussi') || status.includes('success') || status.includes('payé')) {
            return 'bg-green-100 text-green-800';
        } else if (status.includes('échec') || status.includes('failed')) {
            return 'bg-red-100 text-red-800';
        } else if (status.includes('en cours') || status.includes('pending')) {
            return 'bg-yellow-100 text-yellow-800';
        }
        
        return 'bg-gray-100 text-gray-800';
    };

    // Fonction pour formater le nom du wallet
    const formatWallet = (wallet) => {
        if (!wallet || wallet === '-') return '-';
        
        // Formater le nom du wallet de manière plus lisible
        return wallet
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Fonction pour obtenir la couleur du badge wallet
    const getWalletBadge = (wallet) => {
        if (!wallet || wallet === '-') return 'bg-gray-100 text-gray-600';
        
        const walletLower = wallet.toLowerCase();
        if (walletLower.includes('wave')) return 'bg-blue-100 text-blue-800';
        if (walletLower.includes('orange')) return 'bg-orange-100 text-orange-800';
        if (walletLower.includes('free')) return 'bg-red-100 text-red-800';
        
        return 'bg-purple-100 text-purple-800';
    };

    // Fonction pour le rendu de la pagination
    const renderPaginationControls = () => {
        if (totalPages <= 1) return null;
        
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-16 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-12 flex items-center justify-center rounded-lg ${
                                currentPage === pageNum
                                    ? "bg-orange-400 text-white"
                                    : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                
                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-14 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    // Calcul des statistiques
    const stats = {
        total: transactions.length,
        credit: transactions.filter(t => t.type === 'credit' || t.type === 'crédit' || t.type === 'recharge de compte' || t.type === 'paiement client').length,
        debit: transactions.filter(t => t.type === 'débit' || t.type === 'virement de salaire').length
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* En-tête avec statistiques */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Historique des Transactions</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <CreditCard className="h-10 w-10 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Entrées (Crédit)</p>
                                <p className="text-2xl font-bold text-green-600">{stats.credit}</p>
                            </div>
                            <ArrowDownCircle className="h-10 w-10 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sorties (Débit)</p>
                                <p className="text-2xl font-bold text-red-600">{stats.debit}</p>
                            </div>
                            <ArrowUpCircle className="h-10 w-10 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Filtres */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedType === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Toutes
                        </button>
                        <button
                            onClick={() => setSelectedType('crédit')}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedType === 'crédit'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Crédits
                        </button>
                        <button
                            onClick={() => setSelectedType('débit')}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedType === 'débit'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Débits
                        </button>
                        <button
                            onClick={() => setSelectedType('virement de salaire')}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedType === 'virement de salaire'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Virements
                        </button>
                        <button
                            onClick={() => setSelectedType('paiement client')}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedType === 'paiement client'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            Paiements
                        </button>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 w-full rounded-full bg-white border border-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tableau des transactions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bénéficiaire/Client
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Montant
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Wallet
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Référence
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedTransactions.length > 0 ? (
                                displayedTransactions.map((transaction, index) => (
                                    <tr key={transaction._id || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(transaction.type)}
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(transaction.type)}`}>
                                                    {transaction.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.prenom} {transaction.nom}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {transaction.dateCreation}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-semibold ${
                                                transaction.type === 'débit' || transaction.type === 'virement de salaire'
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                            }`}>
                                                {transaction.type === 'débit' || transaction.type === 'virement de salaire' ? '-' : '+'} {transaction.montant}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWalletBadge(transaction.wallet)}`}>
                                                {formatWallet(transaction.wallet)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.statut)}`}>
                                                {transaction.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500 font-mono">
                                                {transaction.reference}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        Aucune transaction trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                        <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)}</span> sur{' '}
                        <span className="font-medium">{filteredTransactions.length}</span> transactions
                    </div>
                    {renderPaginationControls()}
                </div>
            </div>
        </div>
    );
};

export default TransactionView;