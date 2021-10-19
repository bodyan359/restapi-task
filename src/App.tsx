import "./styles.css";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";

import ReactPaginate from "react-paginate";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { map, of } from "rxjs";

export default function App() {
  const [data, setData] = useState<any>([]);
  const [dataAfterSort, setDataAfterSort] = useState<any>([]);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const photosOnPage: number = 15;
  const PAGE_RANGE_DISPLAYED: number = 2;
  const MARGIN_PAGES_DISPLAYED: number = 3;
  const pageVisited: number = pageNumber * photosOnPage;
  let displayData = dataAfterSort.length > 0 ? dataAfterSort : data;
  const pageCount: number = Math.ceil(displayData.length / photosOnPage);
  const [obsArray, setObsArray] = useState<any>();
  const [selectedGroupId, setSelectedGroupId] = useState<number | string>(
    "All"
  );

  useEffect(() => {
    const fetchData = async () => {
      const response: any = await axios.get(
        "http://jsonplaceholder.typicode.com/photos"
      );
      setData(response.data);
      let arr: number[] = [];
      response.data.map((item: any) => {
        return arr.indexOf(item.albumId) === -1 && arr.push(item.albumId);
      });
      setObsArray(arr);
    };
    fetchData();
  }, []);

  const handleDeletePhoto = (id: string) => () => {
    axios
      .delete(`https://jsonplaceholder.typicode.com/photos/${id}`, {
        data: { method: "DELETE" },
      })
      .then((response) =>
        alert(
          "Deleted " +
            (response.statusText.length > 0
              ? response.statusText
              : response.status)
        )
      )
      .catch((err) => alert("Error " + err));
  };

  const fetchBlocks = () => {
    let observableData = of(data);
    observableData
      .pipe(
        map((elements: any[]) => {
          return elements.filter(
            (el) => el.albumId === Number(selectedGroupId)
          );
        })
      )
      .subscribe((x) => setDataAfterSort(x));
    displayData = setDataAfterSort.length > 0 ? dataAfterSort : data;
  };

  const handleGroupChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupId(event.target.value);
  };

  useEffect(() => {
    fetchBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId]);
  console.log(displayData);

  const displayBlocks = displayData
    .slice(pageVisited, pageVisited + photosOnPage)
    .map((item: any) => {
      return (
        <div className="photo_data" key={item.id}>
          <Popup
            trigger={<img src={item?.thumbnailUrl} alt={item?.title} />}
            position="center center"
            arrow={false}
          >
            <img className="popup" src={item?.url} alt={item?.title} />
          </Popup>
          <button className="button" onClick={handleDeletePhoto(item.id)}>
            Delete
          </button>
        </div>
      );
    });

  const changePage = ({ selected = 0 as number }) => {
    setPageNumber(selected);
  };

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <h1>Bohdan Y.</h1>
        <div>
          Sort by groups id:{" "}
          <select
            onChange={(event) => handleGroupChange(event)}
            className="form-control"
            placeholder="Sel"
          >
            <option>All</option>
            {obsArray &&
              obsArray.map((obsNumber: number) => (
                <option key={obsNumber} value={obsNumber}>
                  {obsNumber}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="App">
        {displayBlocks}
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName={"pagination_Buttons"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          pageRangeDisplayed={PAGE_RANGE_DISPLAYED}
          marginPagesDisplayed={MARGIN_PAGES_DISPLAYED}
        />
      </div>
    </>
  );
}
