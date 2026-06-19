import hashlib
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from data import carregar_banco, salvar_banco
from doencas import calcular_probabilidade_doenca, obter_confianca_diagnostico, obter_doencas_por_especie
from validacoes_multiplas import (
    perguntas_fatores_risco_cao,
    perguntas_fatores_risco_gato,
    perguntas_sintomas_cao,
    perguntas_sintomas_gato,
    validar_especie,
)

print("Diagnóstico Veterinário")
print("-" * 40)

medicos, anamneses = carregar_banco()

# Funções obrigatórias
def fazer_hash_senha(senha):
    """Converte senha em hask SHA-256"""
    return hashlib.sha256(senha.encode()).hexdigest()
def pergunta_sn(pergunta):
    while True:
        resposta = input(pergunta + " ").strip().upper()
        if resposta in ["S", "N"]:
            return resposta == "S"
        else:
            print("Digite apenas 'S' para Sim ou 'N' para Não")
def validar_nome():
    while True:
        nome = input("Nome do paciente: ").strip()

        if nome == "":
            print("O nome não pode estar vazio.")
        elif nome.isdigit():
            print("O nome não pode ser apenas números.")
        elif not any(letra.isalpha() for letra in nome):
            print("O nome deve conter letras.")
        else:
            return nome.capitalize()
def validar_dias_sintomas():
    while True:
        dias = input("Há quantos dias os sintomas começaram? ").strip()
        if not dias.isdigit():
            print("Digite apenas números.")
        else:
            dias = int(dias)
            if dias < 0 or dias > 14:
                print("Informe um valor entre 0 e 14 dias.")
            else:
                return dias
def validar_vacinacao():
    opcoes = {"C": "Completa", "I": "Incompleta", "D": "Desconhecido"}
    while True:
        r = input("Vacinação (C=Completa, I=Incompleta, D=Desconhecida): ").strip().upper()
        if r in opcoes:
            return r
        print("Digite C, I ou D")
def validar_idade():
    while True:
        anos = input("Idade - anos: ").strip()
        meses = input("Idade - meses: ").strip()

        if not anos.isdigit():
            print("Os anos devem ser um número.")
            continue

        if not meses.isdigit():
            print("Os meses devem ser um número.")
            continue
        anos = int(anos)
        meses = int(meses)

        if anos < 0 or anos > 30:
            print("Idade em anos inválida.")
        elif meses < 0 or meses > 11:
            print("Meses devem estar entre 0 e 11.")
        else:
            return anos, meses
def validar_raca():
    while True:
        raca = input("Raça do paciente: ").strip()

        if raca == "":
            print("A raça não pode estar vazia.")
        elif raca.isdigit():
            print("A raça não pode ser númerica.")
        else:
            return raca.lower()

def cadastrar_medico():
    nome = input("Nome do médico: ")
    senha = input("Senha: ")
    id_medico = str(len(medicos) + 1)

    medicos[id_medico] = {
        "nome": nome,
        "senha": fazer_hash_senha(senha)
    }
    print(f"Cadastro realizado! Seu ID é: {id_medico}")

def login_medico():
    id_medico = input("ID do médico: ")
    senha = input("Senha: ")

    if id_medico in medicos and medicos[id_medico]["senha"]== fazer_hash_senha(senha):
        print(f"Bem-vindo Dr(a). {medicos[id_medico]['nome']}")
        return id_medico
    else:
        print("Login inválido.")
        return None

def enviar_anamnese(id_medico, dados, resultado):
    ficha = {
        "id_medico": id_medico,
        "dados": dados,
        "resultado": resultado,
        "status": "Pendente",
        "data_envio": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "data_analise": None,
        "notas_medico": ""
    }

    anamneses.append(ficha)
    print("Anamnese enviada com sucesso ao médico!")

def ver_anamneses(id_medico):
    print("\n--- ANAMNESES RECEBIDAS ---")
    encontrou = False
    for ficha in anamneses:
        if ficha["id_medico"] == id_medico:
            encontrou = True
            print("\n" + "=" * 50)
            print(f"STATUS: {ficha['status']} | DATA: {ficha['data_envio']}")
            print("=" * 50)
            print("\nPACIENTE:")
            print(f" Nome: {ficha['dados']['nome']}")
            print(f" Raça: {ficha['dados']['raca']}")
            print(f" Idade: {ficha['dados']['idade']}")
            print(f" Espécie: {ficha['dados']['especie']}")

            print("\nVACINAÇÃO E HISTÓRICO:")
            print(f" Vacinação: {ficha['dados']['vacinacao']}")
            print(f" Dias com sintomas: {ficha['dados']['dias_sintomas']}")

            print("\nDIAGNÓSTICO:")
            print(f" Probabilidade: {ficha['resultado']['probabilidade']}")
            print(f"  Confiança: {ficha['resultado']['confianca']}")
            print(f"  Interpretação: {ficha['resultado']['interpretacao']}")
            print(f"  Urgência: {ficha['resultado']['urgencia']}")
            print(f"  Sinais-chave detectados: {ficha['resultado']['sinais_chave']}")

            print("\n SINAIS POSITIVOS:")
            for sinal in ficha["resultado"]["sinais_positivos"]:
                print(f"    • {sinal}")

            print("\n SINAIS NEGATIVOS:")
            for sinal in ficha["resultado"]["sinais_negativos"]:
                print(f"    • {sinal}")
            if ficha.get("notas_medico"):
                print(f"\nNOTAS DO MÉDICO: {ficha['notas_medico']}")
            if ficha["data_analise"]:
                print(f"Data da análise: {ficha['data_analise']}")

    if not encontrou:
        print("Você não possui anamneses ainda.")
def adicionar_notas_medico(id_medico):
    """Permite ao médico adicionar notas a uma anamnese"""
    if not anamneses:
        print("Nenhuma anamnese disponível.")
        return

    print("\n-- SUAS ANAMNESES ---")
    contador = 0
    for i, ficha in enumerate(anamneses):
        if ficha["id_medico"] == id_medico:
            print(f"\n[{contador}] Paciente: {ficha['dados']['nome']} | Status: {ficha['status']}")
            print(f"    Data: {ficha['data_envio']}")
            contador += 1
    if contador == 0:
        print("Você não possui anamneses.")
        return
    try:
        indice = int(input("\nDigite o número da anamnese para adicionar notas: "))
        contador = 0
        for i, ficha in enumerate(anamneses):
            if ficha["id_medico"] == id_medico:
                if contador == indice:
                    notas = input("Digite suas notas clínicas: ").strip()
                    ficha["notas_medico"] = notas
                    ficha["status"] = "Analisada"
                    ficha["data_analise"] = datetime.now().strftime("%d/%m/%Y %H:%M")
                    salvar_banco(medicos, anamneses)
                    print("Notas adicionadas com sucesso!")
                    return
                contador += 1
        print("Anamnese não encontrada.")
    except ValueError:
        print("Digite um número válido.")

def buscar_anamnese(id_medico):
    """Permite buscar anamnese por nome do paciente, status ou data"""
    if not anamneses:
        print("Nenhuma anamnese disponível.")
        return

    print("\n=== BUSCAR ANAMNESE ===")
    print("1 - Buscar por nome do paciente")
    print("2 - Buscar por status")
    print("3 - Listar todas")

    opcao_busca = input("Escolha uma opção: ")

    resultados = []

    if opcao_busca == "1":
        nome_busca = input("Digite o nome do paciente: ").strip().lower()
        for ficha in anamneses:
            if ficha["id_medico"] == id_medico and nome_busca in ficha['dados']['nome'].lower():
                resultados.append(ficha)

    elif opcao_busca == "2":
        print("1 - Pendente")
        print("2 - Analisada")
        status_opcao = input("Escolha o status: ")

        status_map = {"1": "Pendente", "2": "Analisada"}
        if status_opcao in status_map:
            status_busca = status_map[status_opcao]
            for ficha in anamneses:
                if ficha["id_medico"] == id_medico and ficha['status'] == status_busca:
                    resultados.append(ficha)
        else:
            print("Opção inválida.")
            return
    elif opcao_busca == "3":
        for ficha in anamneses:
            if ficha["id_medico"] == id_medico:
                resultados.append(ficha)
    else:
        print("Opção inválida.")
        return
    # mostrar os resultados
    if not resultados:
        print("Nenhuma anamnese encontrada.")
        return
    print(f"\n {len(resultados)} anamnese(s) encontradas(s):\n")
    for i, ficha in enumerate(resultados):
        print(f"[{i}] {ficha['dados']['nome']} | Status: {ficha['status']} | Data: {ficha['data_envio']}")

def exportar_anamnese_pdf(id_medico):
    """Exportar uma anamnese para arquivo PDF"""
    if not anamneses:
        print("Nenhuma anamnese disponível para exportar.")
        return

    print("\n=== EXPORTAR ANAMNESE ===")
    contador = 0
    anamneses_medico = []

    for ficha in anamneses:
        if ficha["id_medico"] == id_medico:
            anamneses_medico.append(ficha)
            print(f"[{contador}] {ficha['dados']['nome']} | Data: {ficha['data_envio']}")
            contador += 1
    if len(anamneses_medico) == 0:
        print("Você não possui aamneses para exportar.")
        return

    if contador == 0:
        print("Você não possui anamneses para exportar.")
        return

    try:
        indice = int(input("\nDigite o número da anamnese para exportar: "))

        if indice < 0 or indice >= len(anamneses_medico):
            print("Anamnese não encontrada.")
            return

        ficha = anamneses_medico[indice]
        nome_paciente = ficha['dados']['nome'].replace(" ", "_")
        nome_arquivo = f"anamnese_{nome_paciente}_{ficha['data_envio'].replace('/', '-').replace(' ', '_')}.pdf"

        # Criando documento PDF
        doc = SimpleDocTemplate(nome_arquivo, pagesize=letter)
        elementos = []

        # estilos visuals
        styles = getSampleStyleSheet()
        titulo_style = ParagraphStyle(
            'titulo',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1f4788'),
            spaceAfter=20,
            alignment=1
        )
        # titulo
        titulo = Paragraph("RELATÓRIO DE ANAMNESE VETERINÁRIA", titulo_style)
        elementos.append(titulo)
        elementos.append(Spacer(1, 0.3 * inch))

        # Informações do paciente
        style_heading = ParagraphStyle(
            'heading_custom',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1f4788'),
            spaceAfter=10
        )

        elementos.append(Paragraph("INFORMAÇÕES DO PACIENTE", style_heading))


        dados_paciente = [
            ['Campo', 'Informação'],
            ['Nome', ficha['dados']['nome']],
            ['Raça', ficha['dados']['raca'].capitalize()],
            ['Idade', ficha['dados']['idade']],
            ['Espécie', ficha['dados']['especie'].capitalize()],
            ['Vacinação', ficha['dados']['vacinacao']],
            ['Dias com sintomas', str(ficha['dados']['dias_sintomas'])]
        ]

        tabela_paciente = Table(dados_paciente, colWidths=[2.5*inch, 3.5*inch])
        tabela_paciente.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f4788')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elementos.append(tabela_paciente)
        elementos.append(Spacer(1, 0.3 * inch))

        # Resultado do diagnóstico
        elementos.append(Paragraph("RESULTADO DO DIAGNÓSTICO", style_heading))

        dados_diagnostico = [
            ['Campo', 'Resultado'],
            ['Probabilidade', f"{ficha['resultado']['probabilidade']}%"],
            ['Confiança', ficha['resultado']['confianca']],
            ['Urgência', ficha['resultado']['urgencia']],
            ['Sinais-chave', str(ficha['resultado']['sinais_chave'])],
            ['Interpretação', ficha['resultado']['interpretacao']]
        ]

        tabela_diagnostico = Table(dados_diagnostico, colWidths=[2.5*inch, 3.5*inch])
        tabela_diagnostico.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f4788')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elementos.append(tabela_diagnostico)
        elementos.append(Spacer(1, 0.3 * inch))

        # Sinais detectados
        elementos.append(Paragraph("SINAIS DETECTADOS", style_heading))

        sinais_text = "Positivos: " + ", ".join(ficha['resultado']['sinais_positivos']) if ficha['resultado']['sinais_positivos'] else "Nenhum"
        elementos.append(Paragraph(sinais_text, styles['Normal']))

        sinais_neg_text = "Negativos: " + ", ".join(ficha['resultado']['sinais_negativos']) if ficha['resultado']['sinais_negativos'] else "Nenhum"
        elementos.append(Paragraph(sinais_neg_text, styles['Normal']))

        elementos.append(Spacer(1, 0.3 * inch))

        # Notas do médico
        if ficha.get("notas_medico"):
            elementos.append(Paragraph("NOTAS DO MÉDICO", style_heading))
            elementos.append(Paragraph(ficha['notas_medico'], styles['Normal']))
            elementos.append(Spacer(1, 0.2 * inch))

        # Rodapé com informações de data
        elementos.append(Spacer(1, 0.2 * inch))
        footer_text = f"Data de envio: {ficha['data_envio']} | Status: {ficha['status']}"
        if ficha['data_analise']:
            footer_text += f" | Data de análise: {ficha['data_analise']}"
        elementos.append(Paragraph(footer_text, styles['Normal']))

        # Gerar PDF
        doc.build(elementos)
        print(f"PDF exportado com sucesso: {nome_arquivo}")

    except ValueError:
        print("Digite um número válido.")

def gerar_relatorio_estatistico(id_medico):
    """Gera um relatório estatístico das anamneses do médico"""
    anamneses_medico = [ficha for ficha in anamneses if ficha["id_medico"] == id_medico]
    if not anamneses_medico:
        print("Nenhuma anamnese disponível para relatório.")
        return
    print("\n" + "=" * 60)
    print("RELATÓRIO ESTATÍSTICO DE ANAMNESES")
    print("=" * 60)
    # Contadores
    total = len(anamneses_medico)
    pendentes = sum(1 for f in anamneses_medico if f['status'] == 'Pendente')
    analisadas = sum(1 for f in anamneses_medico if f['status'] == 'Analisada')
    print("\nRESUMO GERAL:")
    print(f"  Total de anamneses: {total}")
    print(f"  Anamneses pendentes: {pendentes}")
    print(f"  Anamneses analisadas: {analisadas}")
    # Probabilidades
    probabilidades = [f['resultado']['probabilidade'] for f in anamneses_medico]
    media_probabilidade = sum(probabilidades) / len(probabilidades)
    max_probabilidade = max(probabilidades)
    min_probabilidade = min(probabilidades)
    print("\nANÁLISE DE PROBABILIDADE:")
    print(f"  Probabilidade média: {media_probabilidade:.1f}%")
    print(f"  Probabilidade máxima: {max_probabilidade}%")
    print(f"  Probabilidade mínima: {min_probabilidade}%")
    # Confiança
    confianca_alta = sum(1 for f in anamneses_medico if f['resultado']['confianca'] == 'Alta')
    confianca_moderada = sum(1 for f in anamneses_medico if f['resultado']['confianca'] == 'Moderada')
    confianca_baixa = sum(1 for f in anamneses_medico if f['resultado']['confianca'] == 'Baixa')
    print("\nANÁLISE DE CONFIANÇA:")
    print(f"  Confiança alta: {confianca_alta} ({(confianca_alta/total)*100:.1f}%)")
    print(f"  Confiança moderada: {confianca_moderada} ({(confianca_moderada/total)*100:.1f}%)")
    print(f"  Confiança baixa: {confianca_baixa} ({(confianca_baixa/total)*100:.1f}%)")
    # Urgência
    emergencia = sum(1 for f in anamneses_medico if "emergência" in f['resultado']['urgencia'].lower())
    avaliacao_rapida = sum(1 for f in anamneses_medico if "rápida" in f['resultado']['urgencia'].lower())
    sem_urgencia = sum(1 for f in anamneses_medico if "Sem sinais" in f['resultado']['urgencia'])
    print("\nANÁLISE DE URGÊNCIA:")
    print(f"  Possível emergência: {emergencia}")
    print(f"  Necessita avaliação rápida: {avaliacao_rapida}")
    print(f"  Sem sinais imediatos de emergência: {sem_urgencia}")
    # Raças mais frequentes
    racas = {}
    for ficha in anamneses_medico:
        raca = ficha['dados']['raca']
        racas[raca] = racas.get(raca, 0) + 1
    print("\nRAÇAS MAIS FREQUENTES:")
    for raca, count in sorted(racas.items(), key=lambda x: x[1], reverse=True):
        print(f"  {raca.capitalize()}: {count}")
    # Média de idade
    idades_totais = []
    for ficha in anamneses_medico:
        idade_str = ficha['dados']['idade'].split(' anos e ')
        anos = int(idade_str[0])
        meses = int(idade_str[1].split(' meses')[0])
        idade_total_meses = (anos * 12) + meses
        idades_totais.append(idade_total_meses)
    if idades_totais:
        media_idade_meses = sum(idades_totais) / len(idades_totais)
        media_idade_anos = int(media_idade_meses // 12)
        media_idade_meses_resto = int(media_idade_meses % 12)
        print("\nANÁLISE DE IDADE:")
        print(f"  Idade média: {media_idade_anos} anos e {media_idade_meses_resto} meses")
        print("\n" + "=" * 60)
    else:
        print("\nANÁLISE DE IDADE:")
        print(" Não há dados de idade disponíveis.")

def rodar_anamnese():

    racas_risco = [
        "rottweiler",
        "dobermann pinscher",
        "pit bull terrier americano",
        "pastor alemão",
        "labrador retriever",
        "springer spaniel inglês",
        "husky",
        "husky siberiano"

    ]
    especie = input("Espécie do paciente (ex: Cão): ").strip().lower()
    nome = validar_nome()
    idade_anos, idade_meses = validar_idade()
    dias_sintomas = validar_dias_sintomas()
    raca = validar_raca()
    raca_risco = raca in racas_risco
    vac = validar_vacinacao()
    id_medico = input("Digite o ID médico do veterinário: ")
    if id_medico not in medicos:
        print("Médico não encontrado.")
        return
    if especie not in ["cão", "cao", "cachorro", "dog"]:
        print("\nSó avaliamos Parvovirose Canina.")
        print("Encerrando o diagnóstico.")
        return

    print(f"\n--- Anamnese de {nome} ---")
    print("Por favor, responda com 'S' para Sim e 'N' para Não.")
    sangue_fezes = pergunta_sn("Apresenta sangue nas fezes?")
    vomitos = pergunta_sn("O animal está vomitando?")
    falta_apetite = pergunta_sn("Demonstra falta de apetite?")
    apatia = pergunta_sn ("Demonstra apatia?")
    febre = pergunta_sn ("Apresenta febre?")
    dor = pergunta_sn ("Demonstra dor?")
    convulsao = pergunta_sn("O animal está convulsionando? ")
    desidratado = pergunta_sn("Há sinais de desidratação (pele pouco elástica, mucosas secas)?")
    prostracao = pergunta_sn("O animal não está levantando?")
    sangramento_intenso = pergunta_sn("Diarreia com sangue em grande quantidade?")
    sinais_chave = sum([sangue_fezes, vomitos, apatia, desidratado, sangramento_intenso])
    if sinais_chave >= 3:
        confianca = "Alta"
    elif sinais_chave == 2:
        confianca = "Moderada"
    else:
        confianca = "Baixa"
    probabilidade = 0
    # FILHOTE
    idade_total = idade_anos * 12 + idade_meses
    if idade_total < 6:
        probabilidade += 20

    # VACINA
    if vac == "C":
        probabilidade -= 35
    elif vac == "I":
        probabilidade -= 10

    # RAÇA DE RISCO
    if raca_risco:
        probabilidade += 5

    # DIAS OCORRIDOS
    if dias_sintomas <= 3:
        probabilidade += 10
    elif dias_sintomas > 7:
        probabilidade -= 10

    # SINTOMAS PRINCIPAIS
    if sangue_fezes:
        probabilidade += 40
    if vomitos:
        probabilidade += 25

    # SINTOMAS GERAIS
    if falta_apetite:
        probabilidade += 15
    if apatia:
        probabilidade += 15
    if febre:
        probabilidade += 10
    if desidratado:
        probabilidade += 15

    # MENOS ESPECÍFICO
    if dor:
        probabilidade += 5

    # SINAL ATÍPICO
    if convulsao:
        probabilidade -= 20

    # COMBINAÇÕES
    if sangue_fezes and vomitos:
        probabilidade += 20
    if not sangue_fezes and not vomitos:
        probabilidade -= 20
    if sangue_fezes and vomitos and apatia:
        probabilidade += 15

    probabilidade = max(0, min(probabilidade, 100))
    if prostracao or sangramento_intenso or (desidratado and vomitos):
        classificacao_urgencia = "Possível emergência veterinária"
    elif probabilidade >= 40:
        classificacao_urgencia = "Necessita avaliação rápida"
    else:
        classificacao_urgencia = "Sem sinais imediatos de emergência"

    sinais_positivos = []
    sinais_negativos = []

    if sangue_fezes:
        sinais_positivos.append("Sangue nas fezes")
    else:
        sinais_negativos.append("Sem sangue nas fezes")
    if vomitos:
        sinais_positivos.append("Vômitos")
    else:
        sinais_negativos.append("Sem vômitos")
    if falta_apetite:
        sinais_positivos.append("Falta de apetite")
    else:
        sinais_negativos.append("Sem falta de apetite")
    if apatia:
        sinais_positivos.append("Apatia")
    else:
        sinais_negativos.append("Sem apatia")
    if febre:
        sinais_positivos.append("Febre")
    else:
        sinais_negativos.append("Sem febre")
    if dor:
        sinais_positivos.append("Dor")
    else:
        sinais_negativos.append("Sem dor")
    if convulsao:
        sinais_positivos.append("Convulsão")
    else:
        sinais_negativos.append("Sem convulsão")
    if desidratado:
        sinais_positivos.append("Desidratação")
    else:
        sinais_negativos.append("Sem desidratação")
    if sangramento_intenso:
        sinais_positivos.append("Sangramento intenso")
    else:
        sinais_negativos.append("Sem sangramento intenso")

    # INTERPRETAÇÃO

    if probabilidade >= 70:
        if sangue_fezes and vomitos:
            diagnostico_texto = "Os sinais clínicos apresentam chance alta de parvovirose pela presença de sangue nas fezes e vômitos."
        else:
            diagnostico_texto = "Chance moderada de parvovirose, diagnóstico não deve ser descartado."

    elif probabilidade >= 40:
        if sangue_fezes or vomitos:
            diagnostico_texto = "Chance moderada de parvovirose, recomenda-se efetuar mais análises."
        else:
            diagnostico_texto = "Chance baixíssima, não possui os sinais clássicos de parvovirose."

    else:
        diagnostico_texto = "Chance nula, não apresenta praticamente nenhum sinal clássico de parvovirose."
    dados = {
        "nome": nome,
        "raca": raca,
        "idade": f"{idade_anos} anos e {idade_meses} meses",
        "vacinacao": vac,
        "dias_sintomas": dias_sintomas,
        "especie": especie
    }

    resultado = {
        "probabilidade": probabilidade,
        "confianca": confianca,
        "interpretacao": diagnostico_texto,
        "urgencia": classificacao_urgencia,
        "sinais_chave": sinais_chave,
        "sinais_positivos": sinais_positivos,
        "sinais_negativos": sinais_negativos
    }
    while True:
        print("\n" + "=" * 50)
        print("RESUMO DO DIAGNÓSTICO")
        print("=" * 50)
        print(f"Probabilidade: {probabilidade}%")
        print(f"Confiança: {confianca}")
        print(f"Interpretação: {diagnostico_texto}")
        print(f"Urgência: {classificacao_urgencia}")
        print("=" * 50)

        opcao_resumo = input("\nDeseja (E)nviar, (R)evisar dados ou (C)ancelar: ").strip().upper()

        if opcao_resumo == "E":
            enviar_anamnese(id_medico, dados, resultado)
            print("\n Anamnese enviada ao médico veterinário com sucesso!")
            break
        elif opcao_resumo == "R":
            print("\n=== REVISAR DADOS ===")
            print("1 - Editar nome do paciente")
            print("2 - Editar idade")
            print("3 - Editar raça")
            print("4 - Editar dias com sintomas")
            print("5 - Editar vacinação")
            print("6 - Voltar ao resumo")

            edicao = input("Escolha o que deseja editar: ")

            if edicao == "1":
                nome = validar_nome()
                dados["nome"] = nome
                print("Nome atualizado!")
            elif edicao == "2":
                idade_anos, idade_meses = validar_idade()
                dados["idade"] = f"{idade_anos} anos e {idade_meses} meses"
                print("Idade atualizada!")
            elif edicao == "3":
                raca = validar_raca()
                dados["raca"] = raca
                print("Raça atualizada!")
            elif edicao == "4":
                dias_sintomas = validar_dias_sintomas()
                dados["dias_sintomas"] = dias_sintomas
                print("Dias com sintomas atualizado!")
            elif edicao == "5":
                vac = validar_vacinacao()
                dados["vacinacao"] = vac
                print("Vacinação atualizada!")
            elif edicao == "6":
                continue
            else:
                print("Opção inválida.")

        elif opcao_resumo == "C":
            print("Anamnese não foi enviada. Sistema cancelou o envio.")
            break
        else:
            print("Opção inválida.")

def menu_principal():
    while True:
        print("\n" + "=" * 50)
        print("SISTEMA VETERINÁRIO DE DIAGNÓSTICO")
        print("=" * 50)
        print("1 - Modo tutor (Preencher Anamnese)")
        print("2 - Modo Médico (Login)")
        print("3 - Cadastrar Novo Médico")
        print("4 - Sair")
        print("=" * 50)

        opcao = input("Escolha uma opção: ")

        if opcao == "1":
            modo_tutor()
        elif opcao == "2":
            modo_medico()
        elif opcao == "3":
            cadastrar_medico()
        elif opcao == "4":
            print("Encerrando sistema...")
            break
        else:
            print("Opção inválida")

def modo_tutor():
    print("\n" + "=" * 50)
    print("MODO TUTOR - Preencher Anamnese")
    print("=" * 50)

    if not medicos:
        print("Nenhum médico cadastrado no sistema.")
        return

    print("\n Médicos Disponíveis:")
    lista_medicos = []
    for i, (id_medico, dados) in enumerate(medicos.items(), 1):
        lista_medicos.append(id_medico)

    try:
        escolha = int(input("\nEscolha o número do médico:")) - 1
        if escolha < 0 or escolha >= len(lista_medicos):
            print("Opção inválida.")
            return
        id_medico_escolhido = lista_medicos[escolha]
        print(f"\n Você selecionou: Dr(a). {medicos[id_medico_escolhido]['nome']}")

        rodar_anamnese_tutor(id_medico_escolhido)

    except ValueError:
        print("Digite um número válido.")

def rodar_anamnese_tutor(id_medico):

    print(f"\n Anamnese para: Dr(a). {medicos[id_medico]['nome']}")

    #passo 1: validar espécie
    especie = validar_especie()
    print(f"\n Espécie selecionada: {'Cão' if especie == 'cao' else 'Gato'}")

    #validar se há doenças para essa espécie
    doencas = obter_doencas_por_especie(especie)
    if not doencas:
        print(f"Desculpe, ainda não temos doenças cadastradas para {especie}s.")
        return

    #passo 2: dados básicos do paciente
    nome = validar_nome()
    idade_anos, idade_meses = validar_idade()
    raca = validar_raca()

    #passo 3: perguntar sintomas específicos da espécie
    print("\n" + "=" * 50)
    if especie == "cao":
        sintomas = perguntas_sintomas_cao(doencas)
        fatores_risco = perguntas_fatores_risco_cao()
    else:  # gato
        sintomas = perguntas_sintomas_gato(doencas)
        fatores_risco = perguntas_fatores_risco_gato()

    #passo 4: calcular probabilidade de cada doença
    print("\n Analisando dados...")
    resultados = calcular_probabilidade_doenca(especie, sintomas, fatores_risco)
    confianca = obter_confianca_diagnostico(sintomas, resultados)

    #passo 5: pegar a doença com maior probabilidade
    doenca_principal = list(resultados.items())[0]
    doenca_info = doenca_principal[1]

    #verificar se há emergência
    sinais_criticos = [s for s in sintomas.keys()
                       if sintomas[s] and s in doenca_info["criticos"]]

    dados = {
        "especie": especie,
        "nome": nome,
        "raca": raca,
        "idade": f"{idade_anos} anos e {idade_meses} meses",
    }

    resultado = {
        "doenca_principal": doenca_info["nome"],
        "probabilidade": doenca_info["probabilidade"],
        "confianca": confianca,
        "urgencia": doenca_info["urgencia"],
        "sinais_positivos": doenca_info["sinais_positivos"],
        "sinais_negativos": doenca_info["sinais_negativos"],
        "todas_doencas": resultados,
        "sinais_criticos": sinais_criticos
    }

    #passo 6: mostrar resultado
    while True:
        print("\n" + "=" * 50)
        print("RESULTADO DA TRIAGEM")
        print("=" * 50)
        print(f"🎯 Diagnóstico Presumível: {doenca_info['nome']}")
        print(f"📊 Probabilidade: {doenca_info['probabilidade']}%")
        print(f"🎯 Confiança: {confianca}")
        print(f"🚨 Urgência: {doenca_info['urgencia']}")

        if sinais_criticos:
            print(f"\n⚠️ SINAIS CRÍTICOS DETECTADOS: {len(sinais_criticos)}")
            for sinal in sinais_criticos:
                print(f"  🔴 {sinal}")

        print(f"\n✓ SINAIS COMPATÍVEIS ({len(doenca_info['sinais_positivos'])}):")
        for sinal in doenca_info["sinais_positivos"][:5]:  # Mostrar top 5
            print(f"  {sinal}")

        if len(resultados) > 1:
            print("\n📋 OUTRAS POSSIBILIDADES:")
            for i, (doenca_alt_nome, doenca_alt_info) in enumerate(list(resultados.items())[1:], 1):
                if i <= 2:
                    print(f"  {i}. {doenca_alt_info['nome']}: {doenca_alt_info['probabilidade']}%")

        print("\n" + "=" * 50)

        opcao_resumo = input("\nDeseja (E)nviar, (V)er Detalhes ou (C)ancelar: ").strip().upper()

        if opcao_resumo == "E":
            enviar_anamnese(id_medico, dados, resultado)
            print("\n✓ Anamnese enviada ao médico veterinário com sucesso!")
            break

        elif opcao_resumo == "V":
            print("\n" + "=" * 50)
            print("DETALHES DA ANÁLISE")
            print("=" * 50)
            for nome_doenca, info_doenca in resultados.items():
                print(f"\n🔹 {info_doenca['nome']}: {info_doenca['probabilidade']}%")
                if info_doenca['sinais_positivos']:
                    print("  ✓ Sinais presentes:")
                    for sinal in info_doenca['sinais_positivos']:
                        print(f"    {sinal}")

        elif opcao_resumo == "C":
            print("Triagem cancelada.")
            break

        else:
            print("Opção inválida.")


def modo_medico():
    """Modo médico: login e operações"""
    id_logado = login_medico()

    if id_logado:
        while True:
            print("\n=== MENU DO MÉDICO ===")
            print("1 - Ver Anamneses")
            print("2 - Adicionar Notas")
            print("3 - Buscar Anamnese")
            print("4 - Exportar Anamnese em PDF")
            print("5 - Relatório Estatístico")
            print("6 - Sair")

            opcao_medico = input("Escolha uma opção: ")

            if opcao_medico == "1":
                ver_anamneses(id_logado)
            elif opcao_medico == "2":
                adicionar_notas_medico(id_logado)
            elif opcao_medico == "3":
                buscar_anamnese(id_logado)
            elif opcao_medico == "4":
                exportar_anamnese_pdf(id_logado)
            elif opcao_medico == "5":
                gerar_relatorio_estatistico(id_logado)
            elif opcao_medico == "6":
                print("✓ Desconectando...")
                break
            else:
                print("Opção inválida.")

#chamar menu principal
if __name__ == "__main__":
    menu_principal()
