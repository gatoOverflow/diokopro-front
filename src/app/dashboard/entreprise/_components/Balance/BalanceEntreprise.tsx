"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useRef } from 'react'
import { CreditCard, Minus, Plus, Send, Loader2, AlertCircle, CheckCircle, Wallet, ArrowUpCircle, ArrowDownCircle, MessageSquarePlus, TrendingUp } from 'lucide-react'
import { envoyerMessage, rechargeCompte, retraitCompte } from '@/actions/Balance'
import OtpInput from '../_Agent/OtpInput';
import { validateOTP } from '@/actions/service';

interface Balance {
  balance: number;
}

interface BalanceProps {
  balances: Balance;
  entrepriseId?: string;
  onBalanceUpdate?: () => void;
}

export default function BalanceEntreprise({ balances, entrepriseId, onBalanceUpdate }: BalanceProps) {
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)
  const [isRetraitOpen, setIsRetraitOpen] = useState(false)
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  
  // États pour OTP - Utilisés pour RECHARGE ET RETRAIT
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [pendingChangeId, setPendingChangeId] = useState('')
  const [otpType, setOtpType] = useState<'recharge' | 'retrait'>('recharge') // Pour différencier le type d'opération
  
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [retraitData, setRetraitData] = useState({
    montant: '',
    numAdmin: '',
    wallet: ''
  })
  const [messageData, setMessageData] = useState({
    titre: '',
    message: ''
  })
  
  const [loading, setLoading] = useState(false)
  const otpInFlight = useRef(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: null, message: '' }), 5000)
  }

  // ==================== RECHARGE ====================
  
  // Demander la recharge
  const handleRecharge = async () => {
    if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
      showNotification('error', 'Veuillez entrer un montant valide')
      return
    }

    if (!entrepriseId) {
      showNotification('error', 'ID entreprise manquant')
      return
    }

    setLoading(true)
    try {
      const response = await rechargeCompte(entrepriseId, {
        montant: Number(rechargeAmount)
      })

      // Gérer tous les cas possibles de réponse
      if (response.type === "success" && response.data?.pendingChangeId) {
        // Cas où la recharge nécessite une validation OTP
        showNotification('success', 'Code OTP envoyé à l\'administrateur')
        setPendingChangeId(response.data.pendingChangeId)
        setOtpType('recharge')
        setShowOtpStep(true)
      } else if (response.message && response.pendingChangeId) {
        // Format de réponse alternatif du middleware
        showNotification('success', 'Code OTP envoyé à l\'administrateur')
        setPendingChangeId(response.pendingChangeId)
        setOtpType('recharge')
        setShowOtpStep(true)
      } else if (response.type === "success") {
        // Cas où la recharge a été créée sans besoin de validation OTP
        showNotification('success', response.message || 'Lien de recharge créé avec succès')
        if (response.data?.data?.paymentUrl) {
          window.open(response.data.data.paymentUrl, '_blank')
        }
        resetRechargeModal()
      } else if (response.errors) {
        // Cas d'erreurs de validation
        const errorMessages = Object.values(response.errors).flat().join(', ')
        showNotification('error', errorMessages)
      } else {
        // Autres cas d'erreur
        showNotification('error', response.error || 'Erreur lors de la recharge')
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion')
      console.error('Erreur recharge:', error)
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser la modal de recharge
  const resetRechargeModal = () => {
    setIsRechargeOpen(false)
    setShowOtpStep(false)
    setOtpCode('')
    setPendingChangeId('')
    setRechargeAmount('')
  }

  // Fermer la modal et réinitialiser
  const handleCloseRechargeDialog = (open: boolean) => {
    if (!open) {
      resetRechargeModal()
    } else {
      setIsRechargeOpen(true)
    }
  }

  // ==================== RETRAIT ====================
  
  // Demander le retrait
  const handleRetrait = async () => {
    if (!retraitData.montant || !retraitData.numAdmin) {
      showNotification('error', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    if (isNaN(Number(retraitData.montant)) || Number(retraitData.montant) <= 0) {
      showNotification('error', 'Veuillez entrer un montant valide')
      return
    }

    if (Number(retraitData.montant) > balances.balance) {
      showNotification('error', 'Solde insuffisant')
      return
    }

    if (!entrepriseId) {
      showNotification('error', 'ID entreprise manquant')
      return
    }

    setLoading(true)
    try {
      const result = await retraitCompte(entrepriseId, {
        montant: Number(retraitData.montant),
        numAdmin: retraitData.numAdmin,
        wallet: retraitData.wallet
      })

      if (result.type === 'success') {
        if (result.requiresOtp) {
          // Le backend demande une validation OTP
          showNotification('success', result.message || 'Code OTP envoyé à l\'administrateur')
          setPendingChangeId(result.data?.pendingChangeId || '')
          setOtpType('retrait')
          setShowOtpStep(true)
        } else {
          // Retrait effectué avec succès sans OTP
          showNotification('success', result.message || 'Retrait effectué avec succès')
          resetRetraitModal()
          if (onBalanceUpdate) onBalanceUpdate()
        }
      } else if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join(', ')
        showNotification('error', errorMessages)
      } else {
        showNotification('error', result.error || 'Erreur lors du retrait')
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion')
      console.error('Erreur retrait:', error)
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser la modal de retrait
  const resetRetraitModal = () => {
    setIsRetraitOpen(false)
    setShowOtpStep(false)
    setOtpCode('')
    setPendingChangeId('')
    setRetraitData({ montant: '', numAdmin: '', wallet: '' })
  }

  // Fermer la modal et réinitialiser
  const handleCloseRetraitDialog = (open: boolean) => {
    if (!open) {
      resetRetraitModal()
    } else {
      setIsRetraitOpen(true)
    }
  }

  // ==================== OTP COMMUN POUR RECHARGE ET RETRAIT ====================
  
  // Vérifier l'OTP - Utilisé pour RECHARGE ET RETRAIT
// ==================== OTP COMMUN POUR RECHARGE ET RETRAIT ====================
  
// Vérifier l'OTP - Utilisé pour RECHARGE ET RETRAIT
const handleVerifyOtp = async (codeFromInput?: string) => {
  if (otpInFlight.current || loading) {
    return
  }

  const code = String(codeFromInput || otpCode || '').replace(/\D/g, '')

  if (!code || code.length !== 6) {
    showNotification('error', 'Veuillez entrer un code OTP valide à 6 chiffres')
    return
  }

  if (!pendingChangeId) {
    showNotification('error', 'Demande de validation introuvable. Relancez l’opération.')
    return
  }

  if (!entrepriseId) {
    showNotification('error', 'Entreprise non disponible')
    return
  }

  otpInFlight.current = true
  setLoading(true)
  try {
    if (otpType === 'recharge') {
      const response = await validateOTP(pendingChangeId, code, entrepriseId)

      if (response.success) {
        showNotification('success', 'Lien de paiement envoyé (SMS, WhatsApp et e-mail) !')
        resetRechargeModal()
        if (onBalanceUpdate) onBalanceUpdate()
      } else {
        showNotification('error', response.error || 'Code OTP invalide ou expiré')
        if (response.errors) {
          Object.values(response.errors).forEach((errorArray: any) => {
            errorArray.forEach((error: string) => {
              showNotification('error', error)
            })
          })
        }
      }
    } else if (otpType === 'retrait') {
      const response = await validateOTP(pendingChangeId, code, entrepriseId)

      if (response.success) {
        showNotification('success', 'Retrait effectué avec succès')
        resetRetraitModal()
        if (onBalanceUpdate) onBalanceUpdate()
      } else {
        showNotification('error', response.error || 'Code OTP invalide ou expiré')
        if (response.errors) {
          Object.values(response.errors).forEach((errorArray: any) => {
            errorArray.forEach((error: string) => {
              showNotification('error', error)
            })
          })
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification OTP:', error)
    showNotification('error', 'Échec de la vérification du code OTP')
  } finally {
    otpInFlight.current = false
    setLoading(false)
  }
}

  // Renvoyer le code OTP - Utilisé pour RECHARGE ET RETRAIT
  const handleResendOtp = async () => {
    setLoading(true)
    try {
      if (otpType === 'recharge') {
        // Renvoyer OTP pour recharge
        const response = await rechargeCompte(entrepriseId!, {
          montant: Number(rechargeAmount),
          resendOtp: true
        })

        if (response.type === 'success' || response.pendingChangeId) {
          showNotification('success', 'Code OTP renvoyé')
          setOtpCode('')
        } else {
          showNotification('error', 'Erreur lors du renvoi du code')
        }
      } else if (otpType === 'retrait') {
        // Renvoyer OTP pour retrait
        const result = await retraitCompte(entrepriseId!, {
          montant: Number(retraitData.montant),
          numAdmin: retraitData.numAdmin,
          wallet: retraitData.wallet,
          resendOtp: true
        })

        if (result.type === 'success') {
          showNotification('success', 'Code OTP renvoyé')
          setOtpCode('')
        } else {
          showNotification('error', 'Erreur lors du renvoi du code')
        }
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // ==================== MESSAGE ====================
  
  const handleSendMessage = async () => {
    if (!messageData.titre || !messageData.message) {
      showNotification('error', 'Veuillez remplir tous les champs')
      return
    }

    if (!entrepriseId) {
      showNotification('error', 'ID entreprise manquant')
      return
    }

    setLoading(true)
    try {
      const result = await envoyerMessage(entrepriseId, {
        titre: messageData.titre,
        message: messageData.message
      })

      if (result.type === 'success') {
        showNotification('success', result.message)
        setMessageData({ titre: '', message: '' })
        setIsMessageOpen(false)
      } else if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join(', ')
        showNotification('error', errorMessages)
      } else {
        showNotification('error', result.error || 'Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion')
      console.error('Erreur envoi message:', error)
    } finally {
      setLoading(false)
    }
  }

  const walletOptions = [
    { value: 'orange-money-senegal', label: 'Orange Money Sénégal' },
    { value: 'free-money-senegal', label: 'Free Money Sénégal' },
    { value: 'wave-senegal', label: 'Wave Sénégal' },
  ]

  return (
    <>
      {/* Notification */}
      {notification.type && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Carte Solde - Design moderne avec gradient */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          {/* Décoration de fond */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-white/80 text-sm font-medium">Solde disponible</span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold tracking-tight">
                {balances.balance.toLocaleString()}
              </span>
              <span className="text-white/70 text-sm font-medium">FCFA</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-300 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Compte actif</span>
            </div>
          </div>
        </div>

        {/* Actions - Alimenter et Débiter */}
        <div className="grid grid-cols-2 gap-3">
          {/* Bouton Alimenter */}
          <Dialog open={isRechargeOpen} onOpenChange={handleCloseRechargeDialog}>
            <DialogTrigger asChild>
              <button className="group flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl hover:shadow-md hover:border-emerald-300 transition-all">
                <div className="bg-emerald-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ArrowUpCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-emerald-700">Alimenter</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  {showOtpStep ? 'Vérification de sécurité' : 'Alimenter le compte'}
                </DialogTitle>
                <DialogDescription>
                  {showOtpStep
                    ? 'Entrez le code de vérification envoyé à l\'administrateur'
                    : 'Entrez le montant que vous souhaitez recharger'
                  }
                </DialogDescription>
              </DialogHeader>

              {!showOtpStep ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="recharge-amount" className="text-gray-700">Montant (FCFA)</Label>
                    <Input
                      id="recharge-amount"
                      type="number"
                      placeholder="Ex: 50000"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      disabled={loading}
                      className="mt-1.5 h-12 text-lg"
                    />
                  </div>
                  <Button
                    onClick={handleRecharge}
                    disabled={loading || !rechargeAmount}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Continuer
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <OtpInput
                    length={6}
                    onComplete={(otp) => setOtpCode(otp)}
                    onSubmit={handleVerifyOtp}
                    onResend={handleResendOtp}
                    disabled={loading}
                    isLoading={loading}
                    loadingText="Vérification en cours..."
                    buttonText="Valider"
                    title="Vérification OTP - Recharge du compte"
                    description={`Un code OTP a été envoyé pour confirmer la recharge de ${Number(rechargeAmount).toLocaleString()} FCFA. Le lien de paiement sera envoyé via SMS après validation.`}
                    timerDuration={60}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Bouton Débiter */}
          <Dialog open={isRetraitOpen} onOpenChange={handleCloseRetraitDialog}>
            <DialogTrigger asChild>
              <button className="group flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-2xl hover:shadow-md hover:border-rose-300 transition-all">
                <div className="bg-rose-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <ArrowDownCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-rose-700">Débiter</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="bg-rose-100 p-2 rounded-lg">
                    <ArrowDownCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  {showOtpStep ? 'Vérification de sécurité' : 'Retrait du compte'}
                </DialogTitle>
                <DialogDescription>
                  {showOtpStep
                    ? 'Entrez le code de vérification envoyé à l\'administrateur'
                    : 'Effectuer un retrait vers un portefeuille mobile'
                  }
                </DialogDescription>
              </DialogHeader>

              {!showOtpStep ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="retrait-amount" className="text-gray-700">Montant (FCFA)</Label>
                    <Input
                      id="retrait-amount"
                      type="number"
                      placeholder="Ex: 25000"
                      value={retraitData.montant}
                      onChange={(e) => setRetraitData({...retraitData, montant: e.target.value})}
                      disabled={loading}
                      className="mt-1.5 h-12 text-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone-number" className="text-gray-700">Numéro de téléphone</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="+221 7X XXX XX XX"
                      value={retraitData.numAdmin}
                      onChange={(e) => setRetraitData({...retraitData, numAdmin: e.target.value})}
                      disabled={loading}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wallet" className="text-gray-700">Portefeuille mobile</Label>
                    <Select
                      value={retraitData.wallet}
                      onValueChange={(value) => setRetraitData({...retraitData, wallet: value})}
                      disabled={loading}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Choisir un portefeuille" />
                      </SelectTrigger>
                      <SelectContent>
                        {walletOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleRetrait}
                    disabled={loading || !retraitData.montant || !retraitData.numAdmin}
                    className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4 mr-2" />
                        Effectuer le retrait
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <OtpInput
                    length={6}
                    onComplete={(otp) => setOtpCode(otp)}
                    onSubmit={handleVerifyOtp}
                    onResend={handleResendOtp}
                    disabled={loading}
                    isLoading={loading}
                    loadingText="Vérification en cours..."
                    buttonText="Valider le retrait"
                    title="Vérification OTP - Retrait"
                    description={`Un code OTP a été envoyé pour confirmer le retrait de ${Number(retraitData.montant).toLocaleString()} FCFA vers ${retraitData.numAdmin}.`}
                    timerDuration={60}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Messagerie - Design amélioré */}
        <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
          <DialogTrigger asChild>
            <button className="w-full group flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl hover:shadow-md hover:border-blue-300 transition-all">
              <div className="bg-blue-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-blue-700 block">Messagerie</span>
                <span className="text-xs text-blue-500">Envoyer un message aux utilisateurs</span>
              </div>
              <Send className="w-4 h-4 text-blue-400 ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MessageSquarePlus className="w-5 h-5 text-blue-600" />
                </div>
                Nouveau message
              </DialogTitle>
              <DialogDescription>
                Envoyer un message à tous les utilisateurs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="message-title" className="text-gray-700">Titre du message</Label>
                <Input
                  id="message-title"
                  type="text"
                  placeholder="Ex: Information importante"
                  value={messageData.titre}
                  onChange={(e) => setMessageData({...messageData, titre: e.target.value})}
                  disabled={loading}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="message-content" className="text-gray-700">Contenu</Label>
                <Textarea
                  id="message-content"
                  placeholder="Rédigez votre message ici..."
                  className="mt-1.5 min-h-[120px] resize-none"
                  value={messageData.message}
                  onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={loading || !messageData.titre || !messageData.message}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}