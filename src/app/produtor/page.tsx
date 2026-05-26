// Adiciona no import:
import SemPermissao from '@/components/ui/SemPermissao'

// Troca o useEffect de autorização por:
useEffect(() => {
  const u = Cookies.get('user')
  if (u) {
    const parsed = JSON.parse(u)
    if (parsed.perfil === 'admin') { setAutorizado(true); return }
    const perm = parsed.permissoes || {}
    if (perm?.produtor?.ver === true) { setAutorizado(true) } else { setAutorizado(false) }
  }
}, [])

// E troca o return de verificação por:
if (autorizado === null) return null
if (!autorizado) return <SemPermissao />
