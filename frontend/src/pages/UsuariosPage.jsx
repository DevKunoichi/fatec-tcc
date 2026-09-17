import React from 'react';

const UsuariosPage = () => {
  return (
    <div>
      <div className="flex justify-between items-start border-b border-gray-300 pb-5 mb-6">
        <div>
          <div className="text-[#1B4BA0] text-[10.5px] uppercase tracking-wider mb-2 font-bold">CRUD 03 · EM BREVE</div>
          <h1 className="text-3xl font-extrabold text-[#16295B] m-0">Usuários do sistema</h1>
          <p className="text-gray-600 mt-2">Gerenciamento de acessos e permissões.</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded shadow-sm p-12 text-center">
        <div className="text-[#16295B] text-xl font-bold mb-2">Página em Desenvolvimento</div>
        <p className="text-gray-500">Este módulo será implementado nas próximas iterações do sistema.</p>
      </div>
    </div>
  );
};

export default UsuariosPage;
