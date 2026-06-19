medicos = {}
anamneses = []

def carregar_banco():
    """Retorna as estruturas em memória"""
    return medicos, anamneses

def salvar_banco(medicos_dict, anamneses_list):
    """Apenas atualiza as variáveis globais"""
    global medicos, anamneses
    medicos = medicos_dict
    anamneses = anamneses_list
    print("Dados atualizados em memória!")

