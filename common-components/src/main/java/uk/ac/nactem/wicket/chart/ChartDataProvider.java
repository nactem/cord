package uk.ac.nactem.wicket.chart;

import java.util.Iterator;

/**
 *
 * @author sam
 */
public interface ChartDataProvider extends Iterable<DataItem>,
        java.io.Serializable {
    public Iterator<DataItem> iterator(long count);
}
