{!editing && (
  <div>
    <label className="text-green-400 text-sm font-medium block mb-2">Senha <span className="text-red-500">*</span></label>
    <input type="password" value={form.senha || ''} onChange={e => setForm({...form, senha: e.target.value})} className="input" placeholder="Senha de acesso" />
  </div>
)}
