package uk.ac.nactem.wicket.chart;

/**
 *
 * @author sam
 */
public interface DataItem extends java.io.Serializable {
    public String getId();
    public Number getSize();
    public String getGroup();
    public String getTitle();
    public String getLabel();
}
