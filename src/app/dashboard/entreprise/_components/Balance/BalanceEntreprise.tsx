"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { CreditCard, Minus, Plus, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
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
  
  // États pour OTP
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [pendingChangeId, setPendingChangeId] = useState('')
  
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
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: null, message: '' }), 5000)
  }

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

   

      // Gérer tous les cas possibles de réponse (comme dans CreateServiceModal)
      if (response.type === "success" && response.data?.pendingChangeId) {
        // Cas où la recharge nécessite une validation OTP
        showNotification('success', 'Code OTP envoyé à l\'administrateur')
        setPendingChangeId(response.data.pendingChangeId)
        setShowOtpStep(true)
      } else if (response.message && response.pendingChangeId) {
        // Format de réponse alternatif du middleware
        showNotification('success', 'Code OTP envoyé à l\'administrateur')
        setPendingChangeId(response.pendingChangeId)
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

  // Vérifier l'OTP et finaliser la recharge
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showNotification('error', 'Veuillez entrer un code OTP valide à 6 chiffres')
      return
    }

    if (!entrepriseId) {
      showNotification('error', 'Entreprise non disponible')
      return
    }

    setLoading(true)
    try {
      

      // Appeler la fonction de validation OTP (similaire à validateOTP dans CreateServiceModal)
      const response = await validateOTP(pendingChangeId, otpCode, entrepriseId)

     

      if (response.success) {
        showNotification('success', 'Lien de paiement envoyé via WhatsApp !')
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
    } catch (error) {
      showNotification('error', 'Échec de la vérification du code OTP')
      console.error('Erreur vérification OTP:', error)
    } finally {
      setLoading(false)
    }
  }

  // Renvoyer le code OTP
  const handleResendOtp = async () => {
    setLoading(true)
    try {
      // Renvoyer la demande de recharge pour obtenir un nouveau code
      const response = await rechargeCompte(entrepriseId!, {
        montant: Number(rechargeAmount)
      })

      if (response.type === 'success' || response.pendingChangeId) {
        showNotification('success', 'Code OTP renvoyé')
        setOtpCode('')
      } else {
        showNotification('error', 'Erreur lors du renvoi du code')
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion')
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
        showNotification('success', result.message)
        setRetraitData({ montant: '', numAdmin: '', wallet: 'orange-money-senegal' })
        setIsRetraitOpen(false)
        if (onBalanceUpdate) onBalanceUpdate()
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
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Gestion de compte */}
        <Card className="shadow-sm border bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="w-5 h-5" />
              Gestion de compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Solde disponible</p>
                <h1 className="text-2xl font-bold">{balances.balance.toLocaleString()} FCFA</h1>
              </div>
              <div className="flex gap-2">
                {/* Bouton Alimenter */}
                <Dialog open={isRechargeOpen} onOpenChange={handleCloseRechargeDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-[#FF8D3C] hover:bg-[#FF8D3C]/90 text-white">
                      <Plus className="w-4 h-4 mr-1" />
                      Alimenter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
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
                      // Étape 1: Saisie du montant
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="recharge-amount">Montant (FCFA)</Label>
                          <Input
                            id="recharge-amount"
                            type="number"
                            placeholder="Entrez le montant"
                            value={rechargeAmount}
                            onChange={(e) => setRechargeAmount(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <Button 
                          onClick={handleRecharge} 
                          disabled={loading || !rechargeAmount}
                          className="w-full bg-[#FF8D3C] hover:bg-[#FF8D3C]/90"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            'Continuer'
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Étape 2: Vérification OTP
                      <div className="py-4">
                        <OtpInput
                          length={6}
                          onComplete={(otp) => setOtpCode(otp)}
                          onSubmit={handleVerifyOtp}
                          onResend={handleResendOtp}
                          disabled={loading}
                          isLoading={loading}
                          loadingText="Vérification en cours..."
                          buttonText="Envoyer le lien via WhatsApp"
                          title="Vérification OTP - Recharge du compte"
                          description={`Un code OTP a été envoyé pour confirmer la recharge de ${Number(rechargeAmount).toLocaleString()} FCFA. Le lien de paiement sera envoyé via WhatsApp après validation.`}
                          timerDuration={60}
                        />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Bouton Débiter */}
                <Dialog open={isRetraitOpen} onOpenChange={setIsRetraitOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-[#FF8D3C] hover:bg-[#FF8D3C]/90 text-white">
                      <Minus className="w-4 h-4 mr-1" />
                      Débiter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Retrait du compte</DialogTitle>
                      <DialogDescription>
                        Effectuer un retrait vers un portefeuille mobile
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="retrait-amount">Montant (FCFA)</Label>
                        <Input
                          id="retrait-amount"
                          type="number"
                          placeholder="Entrez le montant"
                          value={retraitData.montant}
                          onChange={(e) => setRetraitData({...retraitData, montant: e.target.value})}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone-number">Numéro de téléphone</Label>
                        <Input
                          id="phone-number"
                          type="tel"
                          placeholder="+221xxxxxxxxx"
                          value={retraitData.numAdmin}
                          onChange={(e) => setRetraitData({...retraitData, numAdmin: e.target.value})}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="wallet">Portefeuille</Label>
                        <Select 
                          value={retraitData.wallet} 
                          onValueChange={(value) => setRetraitData({...retraitData, wallet: value})}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un portefeuille" />
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
                        className="w-full bg-[#FF8D3C] hover:bg-[#FF8D3C]/90"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Retrait en cours...
                          </>
                        ) : (
                          'Effectuer le retrait'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Messagerie */}
        <Card className="shadow-sm border bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Send className="w-5 h-5" />
              Messagerie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#FF8D3C] hover:bg-[#FF8D3C]/90 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Composer un message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau message</DialogTitle>
                  <DialogDescription>
                    Envoyer un message aux utilisateurs
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="message-title">Titre</Label>
                    <Input
                      id="message-title"
                      type="text"
                      placeholder="Titre du message"
                      value={messageData.titre}
                      onChange={(e) => setMessageData({...messageData, titre: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message-content">Message</Label>
                    <Textarea
                      id="message-content"
                      placeholder="Contenu du message"
                      className="min-h-[100px]"
                      value={messageData.message}
                      onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={loading || !messageData.titre || !messageData.message}
                    className="w-full bg-[#FF8D3C] hover:bg-[#FF8D3C]/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le message'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </>
  )
}