def validar_especie():
    while True:
        print("\n Qual é a espécie do paciente?")
        print("1 - Cão")
        print("2 - Gato")

        opcao = input("Escolha uma opção: ").strip()

        if opcao == "1":
            return "cao"
        elif opcao == "2":
            return "gato"
        else:
            print("Opção inválida. Digite somente 1 ou 2.")

def perguntas_sintomas_cao(doencas):
    sintomas = {}

    print("\n Selecione os sintomas presentes:")
    print("(Digite 's' para SIM ou 'n' para NÃO)\n")

    #sintomas gerais
    sintomas["vomitos"] = validar_simples("O animal está vomitando?")
    sintomas["diarreia"] = validar_simples("O animal apresenta diarreia?")
    sintomas["sangue_fezes"] = validar_simples("O animal apresenta sangue nas fezes?")
    sintomas["apatia"] = validar_simples("Demonstra falta de energia (apatia)?")
    sintomas["febre"] = validar_simples("O animal está com febre?")
    sintomas["falta_apetite"] = validar_simples("O animal está com falta de apetite?")
    sintomas["desidratado"] = validar_simples("O animal está desidratado?")
    sintomas["dor"] = validar_simples("O animal aparenta estar com dor no abdomen?")

    #sintomas especifico de cinomose Canina
    sintomas["secrecao_ocular"] = validar_simples("O animal está com pus nos olhos?")
    sintomas["secrecao_nasal"] = validar_simples("O animal está com pus nas narinas?")
    sintomas["convulsoes"] = validar_simples("O animal está convulsionando?")
    sintomas["tosse"] = validar_simples("O animal está tossindo?")

    # sintomas especíicos de erliquiose
    sintomas["sangramento_espontaneo"] = validar_simples("Apresenta sangramento espontâneo (nasal ou hematomas)?")
    sintomas["apatia_extrema"] = validar_simples("Apresenta sono/cansaço extremo?")
    sintomas["linfonodos_aumentados"] = validar_simples("Apresenta alguma íngua (caroço inchado) no pescoço, axilas ou virilha do animal?")
    sintomas["mancada"] = validar_simples("Apresenta mancada ao andar?")

    return sintomas

def perguntas_sintomas_gato(doencas):
    sintomas = {}

    print("\n Selecione os sintomas presentes:")
    print("(Digite 's' para SIM ou 'n' para NÃO)\n")

    #sintomas gerais
    sintomas["vomito"] = validar_simples("O animal está vomitando?")
    sintomas["diarreia"] = validar_simples("Apresenta diarreia?")
    sintomas["apatia"] = validar_simples("Demonstra apatia (falta de energia)?")
    sintomas["perda_apetite"] = validar_simples("Demonstra falta de apetite (Não come)?")
    sintomas["desidratacao"] = validar_simples("Há sinais de desidratração?")
    sintomas["dor_abdominal"] = validar_simples("Demonstra dor abdominal?")

    #sintomas urinários
    sintomas["nao_consegue_urinar"] = validar_simples("O gato tenta urinar SEM produzir urina?")
    sintomas["bexiga_distendida"] = validar_simples("Bexiga está dura/distendida ao toque?")
    sintomas["polaquiuria"] = validar_simples("Urina com muita frequência em pequena quantidade?")
    sintomas["hematuria"] = validar_simples("Apresenta sangue na urina?")
    sintomas["vocalizacao_dor"] = validar_simples("Mia (chora) ao tentar urinar?")
    sintomas["lambedura_genital"] = validar_simples("Lambe muito a região genital?")
    sintomas["urinar_local_incomum"] = validar_simples("Urina em locais incomuns (fora da caixa)?")

    return sintomas

def perguntas_fatores_risco_cao():
    fatores = {}

    print("\n Informações de Risco:")

    fatores["vacinacao_completa"] = validar_simples("Possui vacinação completa?")
    if not fatores["vacinacao_completa"]:
        fatores["vacinacao_incompleta"] = validar_simples("Vacinação está incompleta/desatualizada?")

    fatores["exposicao_carrapato"] = validar_simples("Há histórico de exposição a carrapatos?")

    return fatores

def perguntas_fatores_risco_gato():
    fatores = {}

    print("\n Informações de Risco:")

    print("Sexo do gato:")
    print("1 - Macho")
    print("2 - Fêmea")
    opcao = input("Escolha: ").strip()

    if opcao == "1":
        fatores["macho"] = True
        fatores["femea"] = False
    else:
        fatores["macho"] = False
        fatores["femea"] = True

    return fatores

def validar_simples(pergunta):
    while True:
        resposta = input(f"{pergunta} (s/n): ").strip().lower()
        if resposta in ["s", "sim"]:
            return True
        elif resposta in ["n", "nao", "não"]:
            return False
        else:
            print("Digite apenas 's' para SIM ou 'n' para NÃO")

