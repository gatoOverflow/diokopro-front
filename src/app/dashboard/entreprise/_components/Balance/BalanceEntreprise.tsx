import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { CreditCard, Minus, Plus, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import {  envoyerMessage, rechargeCompte, retraitCompte } from '@/actions/Balance'


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
      const result = await rechargeCompte(entrepriseId, {
        montant: Number(rechargeAmount)
      })

      if (result.type === 'success') {
        showNotification('success', result.message)
        if (result.data?.data?.paymentUrl) {
          window.open(result.data.data.paymentUrl, '_blank')
        }
        setRechargeAmount('')
        setIsRechargeOpen(false)
        if (onBalanceUpdate) onBalanceUpdate()
      } else if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join(', ')
        showNotification('error', errorMessages)
      } else {
        showNotification('error', result.error || 'Erreur lors de la création du lien de recharge')
      }
    } catch (error) {
      showNotification('error', 'Erreur de connexion')
      console.error('Erreur recharge:', error)
    } finally {
      setLoading(false)
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
                <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-[#FF8D3C] hover:bg-[#FF8D3C]/90 text-white">
                      <Plus className="w-4 h-4 mr-1" />
                      Alimenter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Alimenter le compte</DialogTitle>
                      <DialogDescription>
                        Entrez le montant que vous souhaitez recharger
                      </DialogDescription>
                    </DialogHeader>
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
                            Création en cours...
                          </>
                        ) : (
                          'Créer le lien de paiement'
                        )}
                      </Button>
                    </div>
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
                    onClick={handleSendMessage}disabled={loading || !messageData.titre || !messageData.message}
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