import { useTranslation } from "react-i18next";
import * as d3 from "d3";
import Flavour from "../../interfaces";

interface SelectFlavourControlProps {
  onChange: (uuid: string) => void;
  value: string,
  hierarchicalFlavours: d3.HierarchyNode<Flavour>[];
}

const SelectFlavourControl = ({ onChange, value, hierarchicalFlavours } : SelectFlavourControlProps) : JSX.Element => {
  const { t } = useTranslation();

  const getLabelForFlavour = (flavour: d3.HierarchyNode<Flavour>) : string => {
    if (!flavour.parent) {
      return flavour.data.key ? t(`flavours.${flavour.data.key}`) : flavour.data.name;
    }

    return flavour
      .ancestors()
      .reverse()
      .slice(1)
      .map((ancestor) => ancestor.data.key ? t(`flavours.${ancestor.data.key}`) : ancestor.data.name).join(" > ");
  }

  return (
    <div className="control">
      <div className="select">
        <select
          id="select-flavour"
          value={value}
          onChange={(e) : void => onChange(e.target.value)}>
          <option value=''></option>
          {hierarchicalFlavours
            .map((flavour) => {
              return {
                key: flavour.data.uuid,
                label: getLabelForFlavour(flavour),
                depth: flavour.depth
              }
            })
            .sort((a, b) => a.depth === 0
              ? -1
              : b.depth === 0
                ? 1
                : a.label.localeCompare(b.label))
            .map((flavour) => (
              <option value={flavour.key} key={flavour.key}>
                {flavour.label}
              </option>
            ))}
        </select>
      </div>
    </div>
  )
}

export default SelectFlavourControl;
