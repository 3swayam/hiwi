from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def calculate_each_section(eachItem):
    iteration_cost_per_section = 0
    monthly_cost_per_section = 0
    fixed_cost_per_section = 0

    for price in eachItem["spec"]:
        # Get inputs for cost & service Type
        isFixed = price['isFixed']
        isFaaS = price['isFaas']

        # Case1: Monthly FAAS - cost/iteration
        if not isFixed and isFaaS:
            cost_per_month = price['price']
            no_of_iteration_monthly = price['noOfIteration']

            cost_per_iteration_for_price = (cost_per_month / no_of_iteration_monthly)
            # Adding to section cost
            iteration_cost_per_section = iteration_cost_per_section + cost_per_iteration_for_price

        elif isFixed and isFaaS:
            # Case2: Fixed FAAS   - cost/month and cost/iteration
            if (price['name'] == "Development" or price['name'] == "Training"):
                fixed_cost = price['price']
                fixed_cost_per_section = fixed_cost_per_section + fixed_cost
            else:
                fixed_cost = price['price']
                No_of_iterations = price['noOfIteration']
                cost_per_iteration = fixed_cost / No_of_iterations

                # Yearly cost & yearly iteration no, to be divided by fixed cost per year
                monthly_cost_per_section = monthly_cost_per_section + (fixed_cost)
                iteration_cost_per_section = iteration_cost_per_section + cost_per_iteration
        else:
            # Case3 and Case4: Fixed PaaS  and Monthly PaaS  - cost/month
            # value entered is monthly cost by default
            cost_per_month = price['price']

            # Adding to section cost
            monthly_cost_per_section = monthly_cost_per_section + cost_per_month
    return iteration_cost_per_section, monthly_cost_per_section, fixed_cost_per_section

@app.route('/add', methods=['POST'])
def add():
    # Extract JSON payload from the request
    data = request.get_json()

    #Start calculation
    total_Cost_per_iteration = 0
    total_Cost_per_month = 0
    total_Fixed_cost = 0
    # Extract the value of isExternalSelected from the JSON payload

    for eachItem in data:
        iteration_cost, monthly_cost, fixed_cost = calculate_each_section(eachItem)
        total_Cost_per_iteration = total_Cost_per_iteration + iteration_cost
        total_Cost_per_month = total_Cost_per_month + monthly_cost
        total_Fixed_cost = total_Fixed_cost + fixed_cost

    # Return the JSON payload as a response
    costs = {
        'total_Cost_per_iteration': total_Cost_per_iteration,
        'total_Cost_per_month': total_Cost_per_month,
        'total_Fixed_cost': total_Fixed_cost
    }
    return jsonify(costs)

if __name__ == '__main__':
    app.run(debug=True)
