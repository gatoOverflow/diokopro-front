"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PaymentListView = ({ payments = [], paymentLinks = [] }) => {
    const [activeTab, setActiveTab] = useState('payments');
    const [paymentPage, setPaymentPage] = useState(1);
    const [paymentLinkPage, setPaymentLinkPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
    const [paymentLinkSearchTerm, setPaymentLinkSearchTerm] = useState('');

    const [filteredPayments, setFilteredPayments] = useState([]);
    const [filteredPaymentLinks, setFilteredPaymentLinks] = useState([]);

    // Filtrage des payments
    useEffect(() => {
        if (payments && payments?.length > 0) {
            if (paymentSearchTerm.trim() !== '') {
                const normalizedSearchTerm = paymentSearchTerm?.toLowerCase().trim();
                const filtered = payments.filter(payment =>
                    payment.beneficiaire?.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    payment.beneficiaire?.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    payment.admin?.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    payment.statut?.toLowerCase().includes(normalizedSearchTerm)
                );
                setFilteredPayments(filtered);
            } else {
                setFilteredPayments(payments);
            }
            setPaymentPage(1);
        }
    }, [paymentSearchTerm, payments]);

    // Filtrage des payment links
    useEffect(() => {
        if (paymentLinks && paymentLinks?.length > 0) {
            if (paymentLinkSearchTerm.trim() !== '') {
                const normalizedSearchTerm = paymentLinkSearchTerm?.toLowerCase().trim();
                const filtered = paymentLinks.filter(link =>
                    link.clientId?.nom?.toLowerCase().includes(normalizedSearchTerm) ||
                    link.clientId?.prenom?.toLowerCase().includes(normalizedSearchTerm) ||
                    link.status?.toLowerCase().includes(normalizedSearchTerm) ||
                    link.typePaymentLink?.toLowerCase().includes(normalizedSearchTerm)
                );
                setFilteredPaymentLinks(filtered);
            } else {
                setFilteredPaymentLinks(paymentLinks);
            }
            setPaymentLinkPage(1);
        }
    }, [paymentLinkSearchTerm, paymentLinks]);

    // Calculs de pagination
    const paymentTotalPages = Math.ceil(filteredPayments?.length / ITEMS_PER_PAGE);
    const paymentStartIndex = (paymentPage - 1) * ITEMS_PER_PAGE;
    const displayedPayments = filteredPayments?.slice(paymentStartIndex, paymentStartIndex + ITEMS_PER_PAGE);

    const paymentLinkTotalPages = Math.ceil(filteredPaymentLinks?.length / ITEMS_PER_PAGE);
    const paymentLinkStartIndex = (paymentLinkPage - 1) * ITEMS_PER_PAGE;
    const displayedPaymentLinks = filteredPaymentLinks.slice(paymentLinkStartIndex, paymentLinkStartIndex + ITEMS_PER_PAGE);

    const renderPaginationControls = (currentPage, totalPages, setPage) => {
        if (totalPages <= 1) return null;
        
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-16 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
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
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-14 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    const renderPaymentsTable = () => {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr className="border-b">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bénéficiaire</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Admin</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Entreprise</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Montant</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date programmée</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayedPayments?.length > 0 ? (
                                displayedPayments?.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {payment.beneficiaire ? 
                                                    `${payment.beneficiaire.prenom} ${payment.beneficiaire.nom}` : 
                                                    <span className="text-gray-400">N/A</span>
                                                }
                                            </div>
                                            {payment.beneficiaire?.telephone && (
                                                <div className="text-xs text-gray-500">{payment.beneficiaire.telephone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {payment.admin ? 
                                                    `${payment.admin.prenom} ${payment.admin.nom}` : 
                                                    <span className="text-gray-400">N/A</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {payment.entrepriseId?.nomEntreprise || <span className="text-gray-400">N/A</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {payment.typeService?.nomService || <span className="text-gray-400">N/A</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {payment.montant?.toLocaleString()} FCFA
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                payment.statut === 'payé' ? 'bg-green-100 text-green-800' :
                                                payment.statut === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {payment.statut || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {payment.typePayement || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {payment.dateProgrammee ? 
                                                    new Date(payment.dateProgrammee).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    }) : 'N/A'
                                                }
                                            </div>
                                            {payment.datePaiement && (
                                                <div className="text-xs text-green-600">
                                                    Payé le {new Date(payment.datePaiement).toLocaleDateString('fr-FR')}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        <div className="text-lg">Aucun paiement trouvé</div>
                                        <div className="text-sm mt-2">Essayez de modifier vos critères de recherche</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center py-4 px-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-700 font-medium">
                        Total: <span className="text-blue-600">{filteredPayments.length}</span> paiements
                        {filteredPayments.length > 0 && ` (Page ${paymentPage} sur ${paymentTotalPages})`}
                    </div>
                    {renderPaginationControls(paymentPage, paymentTotalPages, setPaymentPage)}
                </div>
            </div>
        );
    };

    const renderPaymentLinksTable = () => {
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr className="border-b">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Entreprise</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Services</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Montant</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Frais</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date programmée</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayedPaymentLinks?.length > 0 ? (
                                displayedPaymentLinks?.map((link) => (
                                    <tr key={link._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {link.clientId ? 
                                                    `${link.clientId.prenom} ${link.clientId.nom}` : 
                                                    <span className="text-gray-400">Client supprimé</span>
                                                }
                                            </div>
                                            {link.clientId?.telephone && (
                                                <div className="text-xs text-gray-500">{link.clientId.telephone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {link.entrepriseId?.nomEntreprise || <span className="text-gray-400">N/A</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {link.clientId?.servicesChoisis && link.clientId.servicesChoisis.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {link.clientId.servicesChoisis.map((service, idx) => (
                                                            <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                                {service.nomService || service.nom}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Aucun service</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {link.montant?.toLocaleString()} FCFA
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {link.frais?.toLocaleString()} FCFA
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                link.estPaye ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {link.estPaye ? 'Payé' : 'Non payé'}
                                            </span>
                                            {link.estEnvoye && (
                                                <div className="text-xs text-blue-600 mt-1">Envoyé</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {link.typePaymentLink || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {link.dateProgrammee ? 
                                                    new Date(link.dateProgrammee).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    }) : 'N/A'
                                                }
                                            </div>
                                            {link.dateReglement && (
                                                <div className="text-xs text-green-600">
                                                    Réglé le {new Date(link.dateReglement).toLocaleDateString('fr-FR')}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        <div className="text-lg">Aucun lien de paiement trouvé</div>
                                        <div className="text-sm mt-2">Essayez de modifier vos critères de recherche</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center py-4 px-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-700 font-medium">
                        Total: <span className="text-blue-600">{filteredPaymentLinks.length}</span> liens de paiement
                        {filteredPaymentLinks.length > 0 && ` (Page ${paymentLinkPage} sur ${paymentLinkTotalPages})`}
                    </div>
                    {renderPaginationControls(paymentLinkPage, paymentLinkTotalPages, setPaymentLinkPage)}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Navigation par onglets */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`${
                                activeTab === 'payments'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
                        >
                            Paiements
                            <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs font-semibold">
                                {filteredPayments.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('paymentLinks')}
                            className={`${
                                activeTab === 'paymentLinks'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
                        >
                            Liens de Paiement
                            <span className="ml-2 bg-orange-100 text-orange-600 py-1 px-2 rounded-full text-xs font-semibold">
                                {filteredPaymentLinks.length}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder={activeTab === 'payments' ? "Rechercher un paiement..." : "Rechercher un lien..."}
                        className="pl-10 pr-4 py-2 w-full rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        value={activeTab === 'payments' ? paymentSearchTerm : paymentLinkSearchTerm}
                        onChange={(e) => 
                            activeTab === 'payments' 
                                ? setPaymentSearchTerm(e.target.value)
                                : setPaymentLinkSearchTerm(e.target.value)
                        }
                    />
                </div>
            </div>

            {/* Contenu des onglets */}
            <div>
                {activeTab === 'payments' && renderPaymentsTable()}
                {activeTab === 'paymentLinks' && renderPaymentLinksTable()}
            </div>
        </div>
    );
};

export default PaymentListView;