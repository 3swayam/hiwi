import "./App.css";
import React, { useState } from "react";
import {
  Switch,
  FormLabel,
  Box,
  Stack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { ChakraProvider, Link, Button } from "@chakra-ui/react";
import {
  Input,
  Table,
  Thead,
  Tbody,
  Text,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";

function App() {
  const AZURE_URL = "https://azure.microsoft.com/en-us/pricing/calculator/";
  const API_URL = "http://127.0.0.1:5000/add";
  const EXTERNAL_SECTION = {
    name: "D",
    isExternal: true,
    spec: [
      {
        name: "Data storage",
        isFixed: false,
        isFaas: false,
        price: 0,
        noOfIteration: 0,
      },
      {
        name: "Container instances",
        isFixed: false,
        isFaas: false,
        price: 0,
        noOfIteration: 0,
      },
    ],
  };
  const SECTIONS_LIST = [
    {
      name: "A",
      isExternal: false,
      spec: [
        {
          name: "Cost Of Ownership",
          isFixed: false,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
        {
          name: "Application",
          isFixed: false,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
        {
          name: "Development",
          isFixed: true,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
      ],
    },
    {
      name: "B",
      isExternal: false,
      spec: [
        {
          name: "Testing",
          isFixed: false,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
        {
          name: "License",
          isFixed: false,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
        {
          name: "Training",
          isFixed: true,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
      ],
    },
    {
      name: "C",
      isExternal: false,
      spec: [
        {
          name: "Data transfer",
          isFixed: false,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
        {
          name: "Hardware",
          isFixed: false,
          isFaas: false,
          price: 0,
          noOfIteration: 0,
        },
      ],
    },
  ];
  const DEFAULT_FIXED = ["Development", "Training"];
  const SECTION_COLOURS = {
    A: "blue.50",
    B: "blue.50",
    C: "blue.50",
    D: "blue.50",
  };

  // Variables
  const [isExternalSelected, setIsExternalSelected] = useState(true);
  const [sectionList, setSectionList] = useState([
    ...SECTIONS_LIST,
    EXTERNAL_SECTION,
  ]);
  const [errorList, setErrorList] = useState([]);
  const [costs, setCosts] = useState(null);

  const handleToggle = () => {
    const isSectionExists = sectionList.some(
      (section) => section.name === EXTERNAL_SECTION.name
    );

    if (isSectionExists) {
      // Remove the section
      const updatedSectionsList = sectionList.filter(
        (section) => section.name !== EXTERNAL_SECTION.name
      );
      setSectionList(updatedSectionsList);
    } else {
      // Add the section
      setSectionList((prevSectionsList) => [
        ...prevSectionsList,
        EXTERNAL_SECTION,
      ]);
    }
    setIsExternalSelected(!isExternalSelected);
  };

  const updateFlag = (sectionIndex, priceIndex, field, event) => {
    const newSectionsList = sectionList.map((section, sIndex) => {
      if (sIndex === sectionIndex) {
        return {
          ...section,
          spec: section.spec.map((price, pIndex) => {
            if (pIndex === priceIndex) {
              return {
                ...price,
                [field]: event
                  ? event.target.value === ""
                    ? ""
                    : Number(event.target.value)
                  : !price[field],
              };
            }
            return price;
          }),
        };
      }
      return section;
    });

    setSectionList(newSectionsList);
  };

  const validatedPayload = () => {
    setErrorList([]);
    const error = [];
    // There should be external sections if external selection is on
    if (isExternalSelected) {
      const hasExternalSection = sectionList.some(
        (section) => section.isExternal
      );
      if (!hasExternalSection) {
        error.push("External section doesn't exist");
      }
    }

    // iteration test
    for (const section of sectionList) {
      for (const specItem of section.spec) {
        if (
          specItem.isFaas &&
          !DEFAULT_FIXED.includes(specItem.name) &&
          specItem.noOfIteration === 0
        ) {
          error.push("For FaaS , iteration must be greater than 0");
        }
      }
    }
    setErrorList(error);
    return error.length > 0 ? false : true;
  };

  const handleClick = () => {
    const isValidated = validatedPayload();
    if (isValidated) {
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionList),
      })
        .then((response) => {
          if (!response.ok) {
            setCosts(null);
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Handle response data
          console.log(data);
          setCosts(data);
        })
        .catch((error) => {
          // Handle errors
          setCosts(null);
          setErrorList(...{ error });
          console.log(error);
        });
    }
  };

  return (
    <ChakraProvider>
      <Box w="100%" p={1} display={"flex"}>
        <FormLabel htmlFor="section-type" mb="0">
          Enable internal?
        </FormLabel>
        <Switch
          id="section-type"
          isChecked={isExternalSelected}
          onChange={handleToggle}
        />
      </Box>
      <Box w="100%" p={1} display={"flex"}>
        <FormLabel htmlFor="section-type" mb="0">
          Selected Type : {isExternalSelected ? "External" : "Internal"}
        </FormLabel>
      </Box>

      {/* Error Alerts */}
      <Stack spacing={3}>
        {errorList.map((error, index) => (
          <Alert status="error" key={index}>
            <AlertIcon />
            {error}
          </Alert>
        ))}
      </Stack>
      <Stack spacing={3}>
        {costs &&
          Object.entries(costs).map(([key, value]) => (
            <Alert status="success" key={key}>
              <AlertIcon />
              <strong>{key}:</strong> {value}
            </Alert>
          ))}
        {errorList.map((error, index) => (
          <Alert status="error" key={index}>
            <AlertIcon />
            {error}
          </Alert>
        ))}
      </Stack>

      {/* Table with all price points */}
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Price Section Name</Th>
              <Th>Fixed/Monthly</Th>
              <Th>FaaS/PaaS</Th>
              <Th>Price</Th>
              <Th>Reference</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sectionList.map((sectionItem, sectionIndex) => {
              // Skip the section with index 4 if the external flag is true
              if (!isExternalSelected && sectionItem.isExternal) {
                return null;
              }
              return (
                <React.Fragment key={sectionIndex}>
                  {sectionItem.spec.map((price, priceIndex) => (
                    <Tr
                      key={priceIndex}
                      bgColor={SECTION_COLOURS[sectionItem.name]}
                    >
                      <Td>{price.name}</Td>
                      <Td>
                        <Switch
                          id={`${priceIndex}-isFixed`}
                          isChecked={price.isFixed}
                          onChange={() => {
                            if (!DEFAULT_FIXED.includes(price.name)) {
                              updateFlag(sectionIndex, priceIndex, "isFixed");
                            }
                          }}
                        />
                        <Text>{price.isFixed ? "Fixed" : "Monthly"}</Text>
                      </Td>
                      <Td>
                        <Switch
                          id={`${priceIndex}-isFaas`}
                          isChecked={price.isFaas}
                          onChange={() =>
                            updateFlag(sectionIndex, priceIndex, "isFaas")
                          }
                        />
                        <Text>{price.isFaas ? "FaaS" : "PaaS"}</Text>
                      </Td>
                      <Td>
                        <Box display="flex" justifyContent="space-between">
                          <Input
                            placeholder="Enter Price"
                            onChange={(event) =>
                              updateFlag(
                                sectionIndex,
                                priceIndex,
                                "price",
                                event
                              )
                            }
                            value={price.price}
                            type="number"
                            width="48%"
                          />
                          <Input
                            disabled={
                              !price.isFaas ||
                              DEFAULT_FIXED.includes(price.name)
                            }
                            value={price.noOfIteration}
                            placeholder="Enter No Of iteration"
                            onChange={(event) =>
                              updateFlag(
                                sectionIndex,
                                priceIndex,
                                "noOfIteration",
                                event
                              )
                            }
                            type="number"
                            width="38%"
                          />
                        </Box>
                      </Td>
                      <Td>
                        {sectionItem.isExternal && (
                          <Link href={AZURE_URL} isExternal>
                            Open Browser
                          </Link>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </React.Fragment>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Action Buttons */}
      <Stack direction="row" spacing={4} mt={4} mb={4}>
        <Button colorScheme="blue" variant="solid" onClick={handleClick}>
          Calculate
        </Button>
        <Button
          colorScheme="gray"
          variant="outline"
          onClick={() => {
            setIsExternalSelected(true);
            setSectionList(SECTIONS_LIST);
          }}
        >
          Reset
        </Button>
      </Stack>
    </ChakraProvider>
  );
}

export default App;
