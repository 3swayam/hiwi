import webbrowser

EXTERNAL = "1"
FIXED_COST = "1"
FaaS = "1"
AZURE_URL = "https://azure.microsoft.com/en-us/pricing/calculator/"
SECTIONS_LIST = [
    {"section": "A", "prices": ["Cost Of Ownership", "Application", "Development"]},  # internal
    {"section": "B", "prices": ["Testing", "License", "Training"]},  # internal
    {"section": "C", "prices": ["Hardware", "Data transfer"]},  # internal
    {"section": "D", "prices": ["Data storage", "Container instances"]}  # external
]

def get_input(prompt):
    while True:
        try:
            value = float(input(prompt))
            if value < 0:
                raise ValueError("Input cannot be negative")
            return value
        except ValueError:
            print("Invalid input. Please enter a valid number.")


def calculate_each_section(eachItem):
    iteration_cost_per_section = 0
    monthly_cost_per_section = 0
    fixed_cost_per_section = 0
    print("___________________________________________________________")
    print("Let's enter price values for Section:", eachItem["section"])

    for price in eachItem["prices"]:
        print("**********************Let's get values for :", price)
        # Get inputs for cost & service Type
        cost_type = FIXED_COST
        service_type = FaaS
        if (price == "Development" or price == "Training"):
            print("By default the cost is fixed cost.")
        else:
            cost_type = input(
            "\nEnter type of (Fixed cost/monthly). Enter  " + FIXED_COST + " if Fixed, else monthly would be assumed: ").strip().lower()
            service_type = input(
            "\nEnter type of (FaaS/PaaS). Enter " + FaaS + "  if FaaS, else PaaS would be assumed: ").strip().lower()

        isFixed = cost_type == FIXED_COST
        isFaaS = service_type == FaaS

        # Open URL for few sections price values
        if (price == SECTIONS_LIST[3]['prices'][0] or price == SECTIONS_LIST[3]['prices'][1]):
            webbrowser.open_new(AZURE_URL)

        # Case1: Monthly FAAS - cost/iteration
        if not isFixed and isFaaS:
            cost_per_month = get_input(f"Please enter cost per month (in euro) : ")
            no_of_iteration_monthly = get_input(f"Please enter no of iterations per month : ")

            cost_per_iteration_for_price = (cost_per_month / no_of_iteration_monthly)
            print("The cost for " + price + " in cost/iteration (in euro) is =",
                  cost_per_iteration_for_price)

            # Adding to section cost
            iteration_cost_per_section = iteration_cost_per_section + cost_per_iteration_for_price

        elif isFixed and isFaaS:
            # Case2: Fixed FAAS   - cost/month and cost/iteration
            if (price == "Development" or price == "Training"):
                fixed_cost = get_input(f"Please enter (Fixed) cost of {price} (in euro): ")
                fixed_cost_per_section = fixed_cost_per_section + fixed_cost
            else:
                fixed_cost = get_input(f"Please enter (Fixed) cost of {price} per month (in euro): ")
                No_of_iterations = get_input(f"Please enter no of iterations per month {price}: ")
                cost_per_iteration = fixed_cost / No_of_iterations
                print("The cost for " + price + " in cost/month (in euro) is =",
                   fixed_cost, "And cost per iteration (in euro) is =", cost_per_iteration)
                # Yearly cost & yearly iteration no, to be divided by fixed cost per year
                monthly_cost_per_section = monthly_cost_per_section + (fixed_cost)
                iteration_cost_per_section = iteration_cost_per_section + cost_per_iteration
        else:
            # Case3 and Case4: Fixed PaaS  and Monthly PaaS  - cost/month
            # value entered is monthly cost by default
            cost_per_month = get_input(f"Please enter cost per month (in euro) : ")
            print("The cost for " + price + " in cost/month (in euro) is =",
                  cost_per_month)
            # Adding to section cost
            monthly_cost_per_section = monthly_cost_per_section + cost_per_month
    return iteration_cost_per_section, monthly_cost_per_section, fixed_cost_per_section

def main():
    total_Cost_per_iteration = 0
    total_Cost_per_month = 0
    total_Fixed_cost = 0
    section_type = input(
        "\nEnter type of (internal/external). Enter  " + EXTERNAL + "  if external, else internal would be assumed: ").strip().lower()

    isExternal = section_type == "1"

    # iterate through all sections and read values,
    # 4th section would be added, only if it's of EXTERNAL Type
    for eachItem in SECTIONS_LIST:
        if isExternal or eachItem["section"] != SECTIONS_LIST[3]["section"]:
            iteration_cost, monthly_cost, fixed_cost = calculate_each_section(eachItem)
            total_Cost_per_iteration = total_Cost_per_iteration + iteration_cost
            total_Cost_per_month = total_Cost_per_month + monthly_cost
            total_Fixed_cost = total_Fixed_cost + fixed_cost
    print("\nTotal spending on cloud service: Cost per iteration (in euro)", total_Cost_per_iteration)
    print("\nTotal spending on cloud service: Cost per Month (in euro)", total_Cost_per_month)
    print("\nTotal spending on cloud service: Fixed Cost (in euro)", total_Fixed_cost)


if __name__ == "__main__":
    main()