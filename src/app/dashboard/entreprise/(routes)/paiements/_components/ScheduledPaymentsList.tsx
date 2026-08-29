"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Calendar, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getPayoutMethods, type PaymentMethod } from '@/actions/paymentMethods';

interface ScheduledPayment {
    _id: string;
    beneficiaire: {
        _id: string;
        nom: string;
        prenom: string;
        telephone: string;
        wallet: string;
        frequencePaiement: string;
    } | null;
    admin: {
        nom: string;
        prenom: string;
    } | null;
    montantProgramme: number;
    salaireActuel: number;
    hasDiscrepancy: boolean;
    discrepancyAmount: number;
    dateProgrammee: string;
    statut: string;
    typePayement: string;
    dateCreation: string;
}

interface Stats {
    totalPaiements: number;
    montantTotal: number;
    paiementsAvecEcart: number;
    soldeEntreprise: number;
}

interface ScheduledPaymentsListProps {
    payments: ScheduledPayment[];
    stats: Stats;
}

const ScheduledPaymentsList = ({ payments, stats }: ScheduledPaymentsListProps) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Libelles des portefeuilles, issus du catalogue de versement
    const [portefeuilles, setPortefeuilles] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        let annule = false;
        getPayoutMethods()
            .then((catalogue) => { if (!annule) setPortefeuilles(catalogue.data); })
            .catch(() => { /* la liste reste affichable avec les codes bruts */ });
        return () => { annule = true; };
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPayments, setFilteredPayments] = useState<ScheduledPayment[]>([]);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        if (payments && payments.length > 0) {
            if (searchTerm.trim() !== '') {
                const normalizedSearchTerm = searchTerm.toLowerCase().trim();
                const filtered = payments.filter(payment =>
                    payment.beneficiaire?.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    payment.beneficiaire?.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    payment.beneficiaire?.telephone?.includes(normalizedSearchTerm)
                );
                setFilteredPayments(filtered);
            } else {
                setFilteredPayments(payments);
            }
            setCurrentPage(1);
        } else {
            setFilteredPayments([]);
        }
    }, [searchTerm, payments]);

    const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedPayments = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMontant = (montant: number) => {
        return montant?.toLocaleString('fr-FR') || '0';
    };

    // La couleur est deduite de l'operateur plutot qu'enumeree par code : le
    // catalogue sert 21 portefeuilles sur 8 pays, et un meme operateur garde
    // sa couleur d'un pays a l'autre.
    const couleurPortefeuille = (code: string, nom: string) => {
        const t = `${code} ${nom}`.toLowerCase();
        if (t.includes('orange')) return 'bg-orange-100 text-orange-700';
        if (t.includes('wave')) return 'bg-cyan-100 text-cyan-700';
        if (t.includes('free')) return 'bg-blue-100 text-blue-700';
        if (t.includes('mtn')) return 'bg-yellow-100 text-yellow-800';
        if (t.includes('airtel')) return 'bg-red-100 text-red-700';
        if (t.includes('moov')) return 'bg-indigo-100 text-indigo-700';
        if (t.includes('djamo')) return 'bg-violet-100 text-violet-700';
        if (t.includes('expresso')) return 'bg-emerald-100 text-emerald-700';
        if (t.includes('money')) return 'bg-teal-100 text-teal-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getWalletBadge = (wallet: string) => {
        const methode = portefeuilles.find((m) => m.code === wallet);
        // Sans libelle connu on affiche le code brut plutot que rien : mieux
        // vaut une valeur technique lisible qu'un tiret muet.
        const nom = methode?.name || wallet || '-';
        const pays = methode?.country_name;

        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${couleurPortefeuille(wallet, nom)}`}
                title={pays ? `${nom} — ${pays}` : nom}
            >
                {nom}
            </span>
        );
    };

    const renderPaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <ChevronLeft size={18} />
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
                            className={`w-10 h-10 flex items-center justify-center rounded-lg ${
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
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    };

    return (
        <div className="mb-10">
            {/* Header avec stats */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-orange-500">Paiements Programmés</h1>
                    {stats.paiementsAvecEcart > 0 && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            <AlertTriangle size={14} />
                            {stats.paiementsAvecEcart} écart(s) détecté(s)
                        </span>
                    )}
                </div>
                <div className="relative rounded-full shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10 pr-10 py-2 w-64 rounded-full bg-white border border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Cards stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Paiements en attente</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalPaiements}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Montant total</p>
                    <p className="text-2xl font-bold text-blue-600">{formatMontant(stats.montantTotal)} FCFA</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Solde entreprise</p>
                    <p className={`text-2xl font-bold ${stats.soldeEntreprise >= stats.montantTotal ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMontant(stats.soldeEntreprise)} FCFA
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-sm text-gray-500">Couverture</p>
                    <p className={`text-2xl font-bold ${stats.soldeEntreprise >= stats.montantTotal ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.montantTotal > 0 ? Math.min(100, Math.round((stats.soldeEntreprise / stats.montantTotal) * 100)) : 100}%
                    </p>
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bénéficiaire</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Téléphone</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Salaire Actuel</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Montant Programmé</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Statut</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        Date Prévue
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-1">
                                        <Wallet size={14} />
                                        Wallet
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayedPayments.length > 0 ? (
                                displayedPayments.map((payment) => (
                                    <tr key={payment._id} className={`hover:bg-gray-50 ${payment.hasDiscrepancy ? 'bg-yellow-50' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {payment.hasDiscrepancy && (
                                                    <AlertTriangle size={16} className="text-yellow-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {payment.beneficiaire?.prenom} {payment.beneficiaire?.nom}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {payment.beneficiaire?.telephone || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-medium text-gray-700">
                                                {formatMontant(payment.salaireActuel)} FCFA
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-bold ${payment.hasDiscrepancy ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {formatMontant(payment.montantProgramme)} FCFA
                                            </span>
                                            {payment.hasDiscrepancy && (
                                                <p className="text-xs text-yellow-600">
                                                    {payment.discrepancyAmount > 0 ? '+' : ''}{formatMontant(payment.discrepancyAmount)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {payment.statut}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {formatDate(payment.dateProgrammee)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getWalletBadge(payment.beneficiaire?.wallet || '')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        Aucun paiement programmé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer avec pagination */}
                <div className="flex justify-between items-center py-4 px-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        {filteredPayments.length} paiement(s) • Page {currentPage} sur {totalPages || 1}
                    </p>
                    {renderPaginationControls()}
                </div>
            </div>
        </div>
    );
};

export default ScheduledPaymentsList;
