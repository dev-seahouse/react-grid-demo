import {
  ReactGrid,
  Column,
  OptionType,
  DefaultCellTypes,
  Row,
  HeaderCell,
  TextCell,
  NumberCell,
  CellChange,
  DropdownCell,
  type CellStyle,
} from "@silevis/reactgrid";
import { useEffect, useState } from "react";
import "@silevis/reactgrid/styles.css";
import "./App.css";

interface ProjectOption {
  id: string;
  name: string;
  function: string;
}

interface Project {
  projectId: string | null;
  percentage: number;
}

interface ManHourRow {
  id: string;
  employee: string;
  department: string;
  position: string;
  projects: Project[];
  assignee: string;
  status: string;
  updatedAt: string;
}

export const roleFunctionOptions: OptionType[] = [
  { value: "research", label: "研发" },
  { value: "operation", label: "运维" },
  { value: "sales", label: "销售" },
  { value: "management", label: "管理" },
];

interface ProjectOptionsMap {
  [manHourId: string]: ProjectOption[];
}

interface ProjectOptionsResponse {
  data: ProjectOptionsMap;
}

const getProjectOptions = async (
  manHourIds: string[]
): Promise<ProjectOptionsResponse> => {
  const optionsMap: ProjectOptionsMap = {
    "1": [
      { id: "general", name: "综合项目", function: "研发" },
      { id: "userGrowth", name: "用户增长", function: "运维" },
      { id: "manHourManagement", name: "工时管理", function: "研发" },
    ],
    "2": [
      { id: "userGrowth", name: "用户增长", function: "运维" },
      { id: "general", name: "综合项目", function: "研发" },
    ],
    "3": [
      { id: "userGrowth", name: "用户增长", function: "运维" },
      { id: "dataAnalysis", name: "数据分析", function: "研发" },
      { id: "infrastructure", name: "基础设施", function: "运维" },
    ],
  };

  await new Promise((resolve) => setTimeout(resolve, 100));

  const result: ProjectOptionsMap = {};
  manHourIds.forEach((id) => {
    if (optionsMap[id]) {
      result[id] = optionsMap[id];
    }
  });

  return { data: result };
};

const getManHours = async (): Promise<{ data: ManHourRow[] }> => {
  return {
    data: [
      {
        id: "1",
        employee: "张三",
        department: "效率工程——前端",
        position: "研发工程师",
        projects: [
          {
            projectId: "general",
            percentage: 30,
          },
          {
            projectId: "userGrowth",
            percentage: 40,
          },
          {
            projectId: "manHourManagement",
            percentage: 30,
          },
        ],
        assignee: "李四",
        status: "进行中",
        updatedAt: "2021-01-01",
      },
      {
        id: "2",
        employee: "李四",
        department: "效率工程——服务端",
        position: "研发工程师",
        projects: [
          {
            projectId: "general",
            percentage: 30,
          },
          {
            projectId: "userGrowth",
            percentage: 40,
          },
        ],
        assignee: "李四",
        status: "进行中",
        updatedAt: "2021-01-01",
      },
      {
        id: "3",
        employee: "王五",
        department: "效率工程——架构",
        position: "研发工程师",
        projects: [
          {
            projectId: "userGrowth",
            percentage: 40,
          },
        ],
        assignee: "李四",
        status: "进行中",
        updatedAt: "2021-01-01",
      },
    ],
  };
};

function getHeaderRow(maxNumProjects: number) {
  const headerCells: HeaderCell[] = [
    { type: "header", text: "员工" },
    { type: "header", text: "所属部门" },
    { type: "header", text: "岗位" },
  ];

  for (let i = 0; i < maxNumProjects; i++) {
    const projectGroupStyle = {
      background: `hsl(${(i * 120) % 360}, 70%, 90%)`,
    };

    headerCells.push(
      {
        type: "header",
        text: `项目${i + 1}`,
        style: projectGroupStyle as CellStyle,
      },
      {
        type: "header",
        text: "职能",
        style: projectGroupStyle as CellStyle,
      },
      {
        type: "header",
        text: "占比",
        style: projectGroupStyle as CellStyle,
      }
    );
  }

  headerCells.push(
    { type: "header", text: "填写人" },
    { type: "header", text: "填写状态" },
    { type: "header", text: "更新时间" },
    {
      type: "header",
      text: "百分比合计",
      style: { background: "#f5f5f5" } as CellStyle,
    }
  );

  return {
    rowId: "header",
    height: 35,
    cells: headerCells,
  };
}

const PERCENTAGE_FORMAT = new Intl.NumberFormat("zh-CN", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface DropdownState {
  [rowId: string]: {
    [key: string]: boolean;
  };
}

export const departments = [
  "效率工程——产品&测试——产品经理",
  "效率工程——服务端",
  "效率工程——前端",
  "效率工程——测试",
  "效率工程——运维",
  "效率工程——架构",
];

const DISABLED_STYLE = {
  backgroundColor: "#f5f5f5",
  color: "#999",
  borderColor: "#e0e0e0",
} as const;

const NON_EDITABLE_STYLE = {
  backgroundColor: "#fafafa",
  color: "#666",
} as const;

interface CreateProjectCellsParams {
  project: Project;
  manHourId: string;
  projectIsOpen: boolean;
  percentageIsOpen: boolean;
  projectOptionsMap: ProjectOptionsMap;
}

const PERCENTAGE_OPTIONS: OptionType[] = [
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "10", label: "10%" },
  { value: "20", label: "20%" },
  { value: "30", label: "30%" },
  { value: "40", label: "40%" },
  { value: "50", label: "50%" },
  { value: "60", label: "60%" },
  { value: "70", label: "70%" },
  { value: "80", label: "80%" },
  { value: "90", label: "90%" },
  { value: "100", label: "100%" },
];

function createProjectCells({
  project,
  manHourId,
  projectIsOpen,
  percentageIsOpen,
  projectOptionsMap,
}: CreateProjectCellsParams): [DropdownCell, TextCell, DropdownCell] {
  const options = projectOptionsMap[manHourId] || [];
  const selectedOption = options.find(
    (option: ProjectOption) => option.id === project.projectId
  );

  return [
    {
      type: "dropdown",
      selectedValue: project.projectId ?? "",
      values: options.map((option: ProjectOption) => ({
        value: option.id,
        label: option.name,
      })),
      isOpen: projectIsOpen,
      groupId: "project-name",
    },
    {
      type: "text",
      text: selectedOption?.function ?? "",
      nonEditable: true,
      style: NON_EDITABLE_STYLE,
      groupId: "project-function",
    },
    {
      type: "dropdown",
      selectedValue: project.percentage.toString(),
      values: PERCENTAGE_OPTIONS,
      isOpen: percentageIsOpen,
      groupId: "project-percentage",
    },
  ];
}

function createEmptyCells(): [DropdownCell, TextCell, DropdownCell] {
  return [
    {
      type: "dropdown",
      values: [],
      selectedValue: "",
      isOpen: false,
      isDisabled: true,
      style: DISABLED_STYLE,
      groupId: "project-name",
    },
    {
      type: "text",
      text: "-",
      nonEditable: true,
      style: DISABLED_STYLE,
      groupId: "project-function",
    },
    {
      type: "dropdown",
      values: [],
      selectedValue: "",
      isOpen: false,
      isDisabled: true,
      style: DISABLED_STYLE,
      groupId: "project-percentage",
    },
  ];
}

function App() {
  const [manHours, setManHours] = useState<ManHourRow[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectOptionsMap>({});
  const [dropdownStates, setDropdownStates] = useState<DropdownState>({});

  const maxNumProjects = manHours.reduce(
    (max, row) => Math.max(max, row.projects.length),
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      const manHoursResponse = await getManHours();
      const manHourIds = manHoursResponse.data.map((mh) => mh.id);

      const [manHoursData, projectOptionsData] = await Promise.all([
        manHoursResponse,
        getProjectOptions(manHourIds),
      ]);

      setProjectOptions(projectOptionsData.data);
      setManHours(manHoursData.data);
    };

    fetchData();
  }, []);

  function getDropdownState(
    rowId: string,
    projectIndex: number,
    field: "project" | "percentage"
  ): boolean {
    return dropdownStates[rowId]?.[`${field}-${projectIndex}`] ?? false;
  }

  const getColumns = (maxNumProjects: number): Column[] => {
    const baseColumns = [
      { columnId: "employee", width: 120 },
      { columnId: "department" },
      { columnId: "position", width: 120 },
    ] satisfies Column[];

    const projectColumns = Array(maxNumProjects)
      .fill(null)
      .flatMap((_, idx) => [
        { columnId: `project-name-${idx + 1}`, width: 120 },
        { columnId: `project-function-${idx + 1}`, width: 120 },
        { columnId: `project-percentage-${idx + 1}`, width: 100 },
      ]) satisfies Column[];

    const endColumns = [
      { columnId: "assignee", width: 120 },
      { columnId: "status", width: 120 },
      { columnId: "updatedAt", width: 120 },
      { columnId: "total-percentage", width: 100 },
    ] satisfies Column[];

    return [...baseColumns, ...projectColumns, ...endColumns];
  };

  const getRows = (manHours: ManHourRow[]) => {
    return [
      getHeaderRow(maxNumProjects),
      ...manHours.map<Row>((manHour, idx) => {
        const baseCells: DefaultCellTypes[] = [
          {
            type: "text",
            text: manHour.employee,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
          {
            type: "text",
            text: manHour.department,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
          {
            type: "text",
            text: manHour.position,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
        ];

        const allProjectCells = Array(maxNumProjects)
          .fill(null)
          .flatMap((_, index) => {
            if (index < manHour.projects.length) {
              return createProjectCells({
                project: manHour.projects[index],
                manHourId: manHour.id,
                projectIsOpen: getDropdownState(manHour.id, index, "project"),
                percentageIsOpen: getDropdownState(
                  manHour.id,
                  index,
                  "percentage"
                ),
                projectOptionsMap: projectOptions,
              });
            }
            return createEmptyCells();
          });

        const totalPercentage = manHour.projects.reduce(
          (sum, project) => sum + project.percentage,
          0
        );

        const totalPercentageCell: NumberCell = {
          type: "number",
          value: totalPercentage / 100,
          format: PERCENTAGE_FORMAT,
          nonEditable: true,
          style: {
            background: totalPercentage === 100 ? "#f0fff0" : "#fff0f0",
            color: totalPercentage === 100 ? "#006400" : "#ff0000",
          } as CellStyle,
        };

        const endCells: DefaultCellTypes[] = [
          {
            type: "text",
            text: manHour.assignee,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
          {
            type: "text",
            text: manHour.status,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
          {
            type: "text",
            text: manHour.updatedAt,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
          totalPercentageCell,
        ];

        return {
          rowId: idx,
          height: 35,
          cells: [...baseCells, ...allProjectCells, ...endCells],
        };
      }),
    ];
  };

  function applyChangesToManHours(
    changes: CellChange[],
    prevManHours: ManHourRow[]
  ): ManHourRow[] {
    const newManHours = [...prevManHours];

    for (const change of changes) {
      if (typeof change.rowId !== "number") {
        continue;
      }

      const data = newManHours[change.rowId];
      const columnId = change.columnId as string;

      if (!columnId.startsWith("project")) {
        continue;
      }

      const projectColIdParts = columnId.split("-");
      const [_, field, indexStr] = projectColIdParts;
      const projectIndex = parseInt(indexStr) - 1;

      if (projectIndex < 0) {
        continue;
      }

      if (change.type === "dropdown") {
        const dropdownCell = change.newCell;
        const previousCell = change.previousCell;

        const isPercentageField = field === "percentage";
        const dropdownKey = isPercentageField
          ? `percentage-${projectIndex}`
          : `project-${projectIndex}`;

        setDropdownStates((prev) => {
          const newState = { ...prev };
          if (!newState[data.id]) {
            newState[data.id] = {};
          }
          newState[data.id][dropdownKey] = Boolean(dropdownCell.isOpen);
          return newState;
        });

        if (
          !dropdownCell.isOpen &&
          dropdownCell.selectedValue &&
          dropdownCell.selectedValue !== previousCell.selectedValue
        ) {
          if (isPercentageField) {
            const percentageValue = parseInt(dropdownCell.selectedValue);
            if (!isNaN(percentageValue)) {
              data.projects[projectIndex].percentage = percentageValue;
            }
          } else {
            data.projects[projectIndex].projectId = dropdownCell.selectedValue;
          }
        }
      }
    }

    return newManHours;
  }
  // type StringKeys<T extends object> = {
  //   [K in keyof T]: T[K] extends string ? K : never;
  // }[keyof T];

  // function isStringKey<T extends object>(
  //   key: PropertyKey,
  //   obj: T
  // ): key is StringKeys<T> {
  //   return key in obj && typeof (obj as any)[key] === "string";
  // }

  function handleChanges(changes: CellChange[]) {
    setManHours((prev) => applyChangesToManHours(changes, prev));
  }

  const rows = getRows(manHours);
  console.log(rows);
  const columns = getColumns(maxNumProjects);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactGrid
        rows={rows}
        columns={columns}
        stickyTopRows={1}
        stickyLeftColumns={3}
        stickyRightColumns={1}
        onCellsChanged={handleChanges}
        enableFillHandle
        enableRowSelection
        enableRangeSelection
        enableColumnSelection
      />
    </div>
  );
}

export default App;
